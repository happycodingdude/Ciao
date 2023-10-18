using MyDockerWebAPI.Interface;
using Telegram.Bot;
using Telegram.Bot.Exceptions;
using Telegram.Bot.Polling;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;
using Telegram.Bot.Types.ReplyMarkups;

namespace MyDockerWebAPI.RestApi
{
    public class TelegramFunction
    {
        private static readonly string DOMAIN_API = "https://api.telegram.org/bot{bot_token}/";
        private static readonly string DOMAIN_API_FILE = "https://api.telegram.org/file/bot{bot_token}/";
        private static readonly string TOKEN = "5975780151:AAEFkSa78E9fNgkS49_aMmeTSO8oy32rZuw";
        private static readonly string USER = "1831683352";
        private readonly ISubmissionService _service;

        public TelegramFunction(ISubmissionService service)
        {
            _service = service;
        }

        public Task StartAsync()
        {
            var botClient = new TelegramBotClient(TOKEN);

            var cts = new CancellationTokenSource();
            var cancellationToken = cts.Token;
            var receiverOptions = new ReceiverOptions
            {
                //AllowedUpdates = new UpdateType[] { UpdateType.CallbackQuery },
                //ThrowPendingUpdates = true
                AllowedUpdates = Array.Empty<UpdateType>()
            };
            botClient.StartReceiving(
                updateHandler: HandleUpdateAsync,
                pollingErrorHandler: HandleErrorAsync,
                receiverOptions: receiverOptions,
                cancellationToken: cts.Token
                );
            return Task.CompletedTask;
        }

        #region logic helper
        public async Task<string> SendButtonMessage(string text, int submissionId)
        {
            try
            {
                var botClient = new TelegramBotClient(TOKEN);
                var InlineKeyboardButtonArr = new InlineKeyboardButton[]
                {
                    InlineKeyboardButton.WithCallbackData("Approve", $"{submissionId}-approve"),
                    InlineKeyboardButton.WithCallbackData("Reject", $"{submissionId}-reject"),
                };
                var inlineKeyboardMarkup = new InlineKeyboardMarkup(InlineKeyboardButtonArr);
                var result = await botClient.SendTextMessageAsync(
                    chatId: USER,
                    text: text,
                    parseMode: ParseMode.Html,
                    replyMarkup: inlineKeyboardMarkup);
                return result.MessageId.ToString();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return string.Empty;
            }
        }

        async Task HandleUpdateAsync(ITelegramBotClient botClient, Update update, CancellationToken cancellationToken)
        {
            // Only process Message updates: https://core.telegram.org/bots/api#message
            // if (update.Message is not { } message)
            //     return;
            // // Only process text messages
            // if (message.Text is not { } messageText)
            //     return Task.CompletedTask;

            // var chatId = message.Chat.Id;
            // Console.WriteLine($"Received a '{messageText}' message in chat {chatId}.");

            try
            {
                if (update.CallbackQuery is not { } messageCallback)
                    return;

                Console.WriteLine($"Received a callback data '{messageCallback.Data}'");

                await botClient.AnswerCallbackQueryAsync(
                    callbackQueryId: update.CallbackQuery.Id,
                    text: "Thank youuuuuuuuu"
                    );

                await botClient.EditMessageReplyMarkupAsync(
                    chatId: messageCallback.Message.Chat.Id,
                    messageId: messageCallback.Message.MessageId
                    );

                var submissionId = int.Parse(messageCallback.Data.Split('-')[0]);
                var state = messageCallback.Data.Split('-')[1];
                _ = UpdateSubmissionState(submissionId, state);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return;
            }
        }

        Task HandleErrorAsync(ITelegramBotClient botClient, Exception exception, CancellationToken cancellationToken)
        {
            var ErrorMessage = exception switch
            {
                ApiRequestException apiRequestException
                    => $"Telegram API Error:\n[{apiRequestException.ErrorCode}]\n{apiRequestException.Message}",
                _ => exception.ToString()
            };

            Console.WriteLine(ErrorMessage);
            return Task.CompletedTask;
        }

        private async Task UpdateSubmissionState(int id, string state)
        {
            var current = await _service.GetById(id);
            current.Status = state;
            current.BeforeUpdate(current);
            await _service.Update(current);
        }
        #endregion
    }
}