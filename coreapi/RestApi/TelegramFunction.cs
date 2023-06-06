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

        // public async Task<SocialUserProfile> GetUserProfile(M02_SocialRegister_VM social, SocialUserProfile_Request model)
        // {
        //     try
        //     {
        //         var botClient = new TelegramBotClient(social.token);
        //         var funcGetChatMemberAsync = botClient.GetChatMemberAsync(model.user_social_id, long.Parse(model.user_social_id));
        //         var funcGetUserProfilePhotosAsync = botClient.GetUserProfilePhotosAsync(long.Parse(model.user_social_id));
        //         Task.WaitAll(funcGetChatMemberAsync, funcGetUserProfilePhotosAsync);

        //         Telegram.Bot.Types.File funcGetFileAsync = null;
        //         var chosenPhoto = funcGetUserProfilePhotosAsync.Result.Photos.FirstOrDefault()?.OrderByDescending(q => q.FileSize).FirstOrDefault();
        //         if (chosenPhoto != null)
        //             funcGetFileAsync = await botClient.GetFileAsync(chosenPhoto.FileId);

        //         var data = new ModelBuilder<SocialUserProfile>()
        //             .SetProperty(q => q.channel_type, ChannelType.Telegram)
        //             .SetProperty(q => q.gender, GenderType.RatherNotSay)
        //             .SetProperty(q => q.customer_name, funcGetChatMemberAsync.Result.User.LastName + " " + funcGetChatMemberAsync.Result.User.FirstName)
        //             .SetProperty(q => q.avatar, funcGetFileAsync != null
        //                                         ? DOMAIN_API_FILE.Replace("{bot_token}", social.token) + funcGetFileAsync.FilePath
        //                                         : null)
        //             .SetProperty(q => q.user_social_id, model.user_social_id)
        //             .SetProperty(q => q.page_social_id, model.page_social_id)
        //             .SetProperty(q => q.list_update_field, new List<string>
        //             {
        //             nameof(SocialUserProfile.customer_name),
        //             nameof(SocialUserProfile.gender),
        //             nameof(SocialUserProfile.avatar)
        //             })
        //             .Build();
        //         return data;
        //     }
        //     catch (Exception ex)
        //     {
        //         var objEx = JObject.FromObject(ex);
        //         if (objEx["ErrorCode"] == null)
        //             objEx = JObject.FromObject(ex.InnerException);
        //         HandleErrorSocial(social, new StackTrace(), objEx["Message"].ToString(), int.Parse(objEx["ErrorCode"].ToString()));
        //         return null; // Just to pass compile error, not gonna reach this
        //     }
        // }

        public static async Task<string> SendMessage(string text)
        {
            // // Prepare model
            // var modelSendMessage = new ModelBuilder<TelegramSendMessageRequest>()
            //     .SetProperty(q => q.user_social_id, model.user_social_id)
            //     .SetProperty(q => q.content_text, model.content_text)
            //     .SetProperty(q => q.content_file_url, model.content_file_url)
            //     .SetProperty(q => q.content_file_name, model.content_file_name)
            //     .Build();

            // if (string.IsNullOrEmpty(modelSendMessage.user_social_id))
            //     return string.Empty;

            // switch (model.interaction_type)
            // {
            //     case InteractionType.Text:
            //         return await SendTextMessage(social, modelSendMessage);
            //     case InteractionType.Image:
            //         return await SendImageMessage(social, modelSendMessage);
            //     case InteractionType.Video:
            //         return await SendVideoMessage(social, modelSendMessage);
            //     case InteractionType.Audio:
            //         return await SendAudioMessage(social, modelSendMessage);
            //     case InteractionType.File:
            //         return await SendFileMessage(social, modelSendMessage);
            //     default:
            //         return string.Empty;
            // }
            return await SendTextMessage(text);
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
        // private void RegisterWebhook(M02_SocialRegister_VM social, string botId)
        // {
        //     var url = DOMAIN_API.Replace("{bot_token}", social.token)
        //         + "setWebhook?url=" + CommonFunc.GetValueDefaultCommonSettingFromMemory("telegram_webhook_url")
        //         + "?botId=" + botId;
        //     var result = APIMethod.HttpJsonAPI(HttpVerb.Post, url);
        //     var responseData = JsonConvert.DeserializeObject<TelegramBaseResponse>(result.Data);
        //     if (!responseData.ok)
        //         HandleErrorSocial(social, new StackTrace(), responseData.description, responseData.error_code);
        // }

        private static async Task<string> SendTextMessage(string text)
        {
            try
            {
                var botClient = new TelegramBotClient(TOKEN);
                var result = await botClient.SendTextMessageAsync(
                    chatId: USER,
                    text: text,
                    parseMode: ParseMode.Html);
                return result.MessageId.ToString();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return string.Empty;
            }
        }

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

        // private async Task<string> SendImageMessage(M02_SocialRegister_VM social, TelegramSendMessageRequest model)
        // {
        //     try
        //     {
        //         var botClient = new TelegramBotClient(social.token);
        //         var result = await botClient.SendPhotoAsync(
        //             chatId: model.user_social_id,
        //             photo: model.content_file_url,
        //             caption: model.content_text,
        //             parseMode: ParseMode.Html);
        //         return result.MessageId.ToString();
        //     }
        //     catch (Exception ex)
        //     {
        //         var objEx = JObject.FromObject(ex);
        //         if (objEx["ErrorCode"] == null)
        //             objEx = JObject.FromObject(ex.InnerException);
        //         HandleErrorSocial(social, new StackTrace(), objEx["Message"].ToString(), int.Parse(objEx["ErrorCode"].ToString()));
        //         return string.Empty; // Just to pass compile error, not gonna reach this
        //     }
        // }

        // private async Task<string> SendVideoMessage(M02_SocialRegister_VM social, TelegramSendMessageRequest model)
        // {
        //     try
        //     {
        //         var botClient = new TelegramBotClient(social.token);
        //         var result = await botClient.SendVideoAsync(
        //             chatId: model.user_social_id,
        //             video: model.content_file_url,
        //             supportsStreaming: true,
        //             caption: model.content_text,
        //             parseMode: ParseMode.Html);
        //         return result.MessageId.ToString();
        //     }
        //     catch (Exception ex)
        //     {
        //         var objEx = JObject.FromObject(ex);
        //         if (objEx["ErrorCode"] == null)
        //             objEx = JObject.FromObject(ex.InnerException);
        //         HandleErrorSocial(social, new StackTrace(), objEx["Message"].ToString(), int.Parse(objEx["ErrorCode"].ToString()));
        //         return string.Empty; // Just to pass compile error, not gonna reach this
        //     }
        // }

        // private async Task<string> SendAudioMessage(M02_SocialRegister_VM social, TelegramSendMessageRequest model)
        // {
        //     try
        //     {
        //         var botClient = new TelegramBotClient(social.token);
        //         var result = await botClient.SendAudioAsync(
        //             chatId: model.user_social_id,
        //             audio: model.content_file_url,
        //             caption: model.content_text,
        //             parseMode: ParseMode.Html);
        //         return result.MessageId.ToString();
        //     }
        //     catch (Exception ex)
        //     {
        //         var objEx = JObject.FromObject(ex);
        //         if (objEx["ErrorCode"] == null)
        //             objEx = JObject.FromObject(ex.InnerException);
        //         HandleErrorSocial(social, new StackTrace(), objEx["Message"].ToString(), int.Parse(objEx["ErrorCode"].ToString()));
        //         return string.Empty; // Just to pass compile error, not gonna reach this
        //     }
        // }

        // private async Task<string> SendFileMessage(M02_SocialRegister_VM social, TelegramSendMessageRequest model)
        // {
        //     try
        //     {
        //         var botClient = new TelegramBotClient(social.token);
        //         var newContentUrl = CommonFunc.ChangeDomainLink(model.content_file_url);
        //         var byteArr = CommonFunc.GetFileFromUrl(newContentUrl);
        //         using (Stream stream = new MemoryStream(byteArr))
        //         {
        //             var result = await botClient.SendDocumentAsync(
        //                 chatId: model.user_social_id,
        //                 document: new InputOnlineFile(content: stream, fileName: model.content_file_name),
        //                 caption: model.content_text,
        //                 parseMode: ParseMode.Html);
        //             return result.MessageId.ToString();
        //         }
        //     }
        //     catch (Exception ex)
        //     {
        //         var objEx = JObject.FromObject(ex);
        //         if (objEx["ErrorCode"] == null)
        //             objEx = JObject.FromObject(ex.InnerException);
        //         HandleErrorSocial(social, new StackTrace(), objEx["Message"].ToString(), int.Parse(objEx["ErrorCode"].ToString()));
        //         return string.Empty; // Just to pass compile error, not gonna reach this
        //     }
        // }

        //public async Task<string> SendButtonMessage(string token, TelegramSendMessageRequest model)
        //{
        //    var botClient = new TelegramBotClient(token);

        //    var cts = new CancellationTokenSource();
        //    var cancellationToken = cts.Token;
        //    var receiverOptions = new ReceiverOptions
        //    {
        //        AllowedUpdates = new UpdateType[] { UpdateType.CallbackQuery },
        //        //ThrowPendingUpdates = true
        //    };
        //    botClient.StartReceiving(HandleUpdateAsync, HandleErrorAsync, receiverOptions, cancellationToken);

        //    InlineKeyboardButton[] InlineKeyboardButtonArr = new InlineKeyboardButton[]
        //    {
        //        InlineKeyboardButton.WithUrl("Mở site", "https://www.google.com/"),
        //        InlineKeyboardButton.WithCallbackData("Gửi value ẩn 1", "HIDDEN_VALUE"),
        //    };
        //    var inlineKeyboardMarkup = new InlineKeyboardMarkup(InlineKeyboardButtonArr);
        //    var result = await botClient.SendTextMessageAsync(
        //        chatId: model.user_social_id,
        //        text: model.content_text,
        //        //parseMode: ParseMode.Html,
        //        replyMarkup: inlineKeyboardMarkup);
        //    return result.MessageId.ToString();
        //}

        //async Task HandleUpdateAsync(ITelegramBotClient botClient, Update update, CancellationToken cancellationToken)
        //{
        //    await botClient.AnswerCallbackQueryAsync(update.CallbackQuery.Id);
        //}

        //async Task HandleErrorAsync(ITelegramBotClient botClient, Exception exception, CancellationToken cancellationToken)
        //{
        //    if (exception is ApiRequestException apiRequestException)
        //    {
        //        await botClient.SendTextMessageAsync(123, apiRequestException.ToString());
        //    }
        //}
        #endregion
    }
}