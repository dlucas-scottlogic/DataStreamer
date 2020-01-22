using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace DataStreamer.API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DataStreamController : ControllerBase
    {
        [HttpGet]
        public async Task Get()
        {
            var context = ControllerContext.HttpContext;
            var isSocketRequest = context.WebSockets.IsWebSocketRequest;

            if (isSocketRequest)
            {
                WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();
                await GetMessages(context, webSocket);
            }
            else
            {
                context.Response.StatusCode = 400;
            }
        }

        private async Task GetMessages(HttpContext context, WebSocket webSocket)
        {
            var javaPath = System.Environment.GetEnvironmentVariable("javapath");
            var generatorJar = System.Environment.GetEnvironmentVariable("generatorpath");
            var profilePath = System.Environment.GetEnvironmentVariable("profilepath");

            var datahelixProcess = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = javaPath,
                    Arguments = $"-jar {generatorJar} --max-rows=100 --profile-file={profilePath}",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    CreateNoWindow = true,
                    RedirectStandardError = true
                }
            };

            var errors = new List<string>();
            datahelixProcess.ErrorDataReceived += (sender, args) =>
            {
                errors.Add(args.Data);
            };

            if (!datahelixProcess.Start())
            {
                throw new Exception($"Could not start datahelix. Filename: {datahelixProcess.StartInfo.FileName} Exitcode: {datahelixProcess.ExitCode} ");
            }

            datahelixProcess.BeginErrorReadLine();

            while (!datahelixProcess.StandardOutput.EndOfStream)
            {
                string line = datahelixProcess.StandardOutput.ReadLine();

                var items = line.Split(",");
                var data = JsonConvert.SerializeObject(
                    new
                    {
                        name = items[1],
                        age = items[2],
                        jobTitle = items[0]
                    });

                var bytes = Encoding.ASCII.GetBytes(data);
                var arraySegment = new ArraySegment<byte>(bytes);
                await webSocket.SendAsync(arraySegment, WebSocketMessageType.Text, true, CancellationToken.None);
                Thread.Sleep(200); //sleeping so that we can see several messages are sent
            }
            
            if (datahelixProcess.ExitCode != 0)
            {
                var errorMessages = String.Join("\r\n", errors);
                throw new InvalidOperationException($"Process exited with error code {datahelixProcess.ExitCode}\r\n{errorMessages}");
            }

            await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "End of stream", CancellationToken.None);
        }        
    }
}
