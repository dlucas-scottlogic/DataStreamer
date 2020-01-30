using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
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

            if (!isSocketRequest)
            {
                context.Response.StatusCode = 400;
                return;
            }

            using (var webSocket = await context.WebSockets.AcceptWebSocketAsync())
            {
                StreamData streamData = null;
                var stringResult = await ReceiveString(webSocket);

                try
                {
                    streamData = JsonConvert.DeserializeObject<StreamData>(stringResult);

                }
                catch
                {
                    throw new Exception("Message was not valid json");
                }

                if (streamData != null)
                {
                    // write profile to disk
                    var profilePath = Environment.GetEnvironmentVariable("profilepath");
                    var filename = WriteFile(streamData.JsonProfile);
                    // send data
                    await SendMessages(webSocket, streamData, filename);
                }
            }
        }

        private async Task<string> ReceiveString(WebSocket webSocket)
        {
            var buffer = new ArraySegment<byte>(new byte[1024 * 4]);
            using (var memoryStream = new MemoryStream())
            {
                WebSocketReceiveResult result;
                do
                {
                    result = await webSocket.ReceiveAsync(buffer, CancellationToken.None);
                    memoryStream.Write(buffer.Array, 0, result.Count);
                }
                while (!result.EndOfMessage);

                memoryStream.Seek(0, SeekOrigin.Begin);

                if (result.MessageType != WebSocketMessageType.Text)
                {
                    throw new Exception("WebSocketMessageType was not Text.");
                }

                using (var reader = new StreamReader(memoryStream, Encoding.UTF8))
                {
                    return await reader.ReadToEndAsync();
                }
            }
        }

        private async Task SendMessages(WebSocket webSocket, StreamData streamData, string profilePath)
        {
            var javaPath = Environment.GetEnvironmentVariable("javapath");
            var generatorJar = Environment.GetEnvironmentVariable("generatorpath");
            var maxRows = streamData.MaxRows.HasValue ? $"--max-rows={streamData.MaxRows}" : "";

            var datahelixProcess = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = javaPath,
                    Arguments = $"-jar {generatorJar} {maxRows} \"--profile-file={profilePath}\" --output-format=json",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    CreateNoWindow = true,
                    RedirectStandardError = true
                }
            };

            try
            {
                var errors = new List<string>();
                datahelixProcess.ErrorDataReceived += (sender, args) =>
                {
                    errors.Add(args.Data);
                };

                if (!datahelixProcess.Start())
                {
                    throw new Exception($"Could not start datahelix. Filename: {datahelixProcess.StartInfo.FileName} Exitcode: {datahelixProcess.ExitCode} ");
                }

                Console.WriteLine($"Process started: {datahelixProcess.Id}");

                datahelixProcess.BeginErrorReadLine();

                while (!datahelixProcess.StandardOutput.EndOfStream)
                {
                    string line = datahelixProcess.StandardOutput.ReadLine();

                    var bytes = Encoding.ASCII.GetBytes(line);
                    var arraySegment = new ArraySegment<byte>(bytes);
                    await webSocket.SendAsync(arraySegment, WebSocketMessageType.Text, true, CancellationToken.None);

                    var receiveBuffer = new byte[255];
                    var respondedInTime = webSocket.ReceiveAsync(new ArraySegment<byte>(receiveBuffer), CancellationToken.None).Wait(TimeSpan.FromSeconds(5));
                    if (!respondedInTime)
                    {
                        await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Timeout waiting for next data row", CancellationToken.None);
                        return; //which will kill the process
                    }
                }

                if (datahelixProcess.ExitCode != 0)
                {
                    var errorMessages = string.Join("\r\n", errors);
                    throw new InvalidOperationException($"Process exited with error code {datahelixProcess.ExitCode}\r\n{errorMessages}");
                }

                await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "End of stream", CancellationToken.None);
            }
            finally
            {
                CloseDataHelixProcess(datahelixProcess);
            }
        }

        private void CloseDataHelixProcess(Process datahelixProcess)
        {
            if (datahelixProcess.HasExited)
            {
                Console.WriteLine($"Process has exited: {datahelixProcess.Id}");
                return;
            }

            Console.WriteLine($"Killing process: {datahelixProcess.Id}");
            datahelixProcess.Kill();
        }

        private string WriteFile(string content)
        {
            var path = Path.GetTempFileName();

            using (StreamWriter outputFile = new StreamWriter(path))
            {
                outputFile.WriteLine(content);
            }

            return path;
        }

    }

    public class StreamData
    {
        public long? MaxRows { get; set; }
        public string JsonProfile { get; set; }
    }
}

