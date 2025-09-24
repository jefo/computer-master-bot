// telegram-client.ts - Main Telegram client implementation

import { ApiResponse } from './telegram-types';
import type { 
  GetMeResponse,
  SendMessageParams, 
  SendMessageResponse,
  GetUpdatesParams,
  GetUpdatesResponse,
  ForwardMessageParams,
  ForwardMessageResponse,
  CopyMessageParams,
  CopyMessageResponse,
  SendPhotoParams,
  SendPhotoResponse,
  SendAudioParams,
  SendAudioResponse,
  SendDocumentParams,
  SendDocumentResponse,
  SendVideoParams,
  SendVideoResponse,
  SendAnimationParams,
  SendAnimationResponse,
  SendVoiceParams,
  SendVoiceResponse,
  SendVideoNoteParams,
  SendVideoNoteResponse,
  SendMediaGroupParams,
  SendMediaGroupResponse,
  SendLocationParams,
  SendLocationResponse,
  EditMessageLiveLocationParams,
  EditMessageLiveLocationResponse,
  StopMessageLiveLocationParams,
  StopMessageLiveLocationResponse,
  SendVenueParams,
  SendVenueResponse,
  SendContactParams,
  SendContactResponse,
  SendPollParams,
  SendPollResponse,
  SendDiceParams,
  SendDiceResponse,
  SendChatActionParams,
  SendChatActionResponse,
  GetUserProfilePhotosParams,
  GetUserProfilePhotosResponse,
  GetFileParams,
  GetFileResponse,
  BanChatMemberParams,
  BanChatMemberResponse,
  UnbanChatMemberParams,
  UnbanChatMemberResponse
} from './telegram-types';

export class TelegramClient {
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(token: string) {
    if (!token) {
      throw new Error('Telegram Bot Token is required');
    }
    
    this.token = token;
    this.baseUrl = `https://api.telegram.org/bot${token}`;
  }

  /**
   * Generic method to make HTTP requests to the Telegram Bot API
   */
  private async request<T>(method: string, data?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}/${method}`;
    
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result: ApiResponse<T> = await response.json();
      
      if (!result.ok) {
        throw new TelegramError(result.description || 'Unknown error', result.error_code);
      }
      
      return result;
    } catch (error) {
      if (error instanceof TelegramError) {
        throw error;
      }
      
      throw new TelegramError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * A simple method for testing your bot's authentication token.
   * Requires no parameters. Returns basic information about the bot.
   */
  async getMe(): Promise<GetMeResponse> {
    const response = await this.request<GetMeResponse>('getMe');
    return response.result!;
  }

  /**
   * Send text messages
   */
  async sendMessage(params: SendMessageParams): Promise<SendMessageResponse> {
    const response = await this.request<SendMessageResponse>('sendMessage', params);
    return response.result!;
  }

  /**
   * Forward messages of any kind
   */
  async forwardMessage(params: ForwardMessageParams): Promise<ForwardMessageResponse> {
    const response = await this.request<ForwardMessageResponse>('forwardMessage', params);
    return response.result!;
  }

  /**
   * Use this method to copy messages of any kind
   */
  async copyMessage(params: CopyMessageParams): Promise<CopyMessageResponse> {
    const response = await this.request<CopyMessageResponse>('copyMessage', params);
    return response.result!;
  }

  /**
   * Send photos
   */
  async sendPhoto(params: SendPhotoParams): Promise<SendPhotoResponse> {
    const response = await this.request<SendPhotoResponse>('sendPhoto', params);
    return response.result!;
  }

  /**
   * Send audio files
   */
  async sendAudio(params: SendAudioParams): Promise<SendAudioResponse> {
    const response = await this.request<SendAudioResponse>('sendAudio', params);
    return response.result!;
  }

  /**
   * Send general files
   */
  async sendDocument(params: SendDocumentParams): Promise<SendDocumentResponse> {
    const response = await this.request<SendDocumentResponse>('sendDocument', params);
    return response.result!;
  }

  /**
   * Send video files
   */
  async sendVideo(params: SendVideoParams): Promise<SendVideoResponse> {
    const response = await this.request<SendVideoResponse>('sendVideo', params);
    return response.result!;
  }

  /**
   * Send animation files (GIF or H.264/MPEG-4 AVC video without sound)
   */
  async sendAnimation(params: SendAnimationParams): Promise<SendAnimationResponse> {
    const response = await this.request<SendAnimationResponse>('sendAnimation', params);
    return response.result!;
  }

  /**
   * Send audio files as voice messages
   */
  async sendVoice(params: SendVoiceParams): Promise<SendVoiceResponse> {
    const response = await this.request<SendVoiceResponse>('sendVoice', params);
    return response.result!;
  }

  /**
   * Send video note messages
   */
  async sendVideoNote(params: SendVideoNoteParams): Promise<SendVideoNoteResponse> {
    const response = await this.request<SendVideoNoteResponse>('sendVideoNote', params);
    return response.result!;
  }

  /**
   * Send a group of photos, videos, documents or audios as an album
   */
  async sendMediaGroup(params: SendMediaGroupParams): Promise<SendMediaGroupResponse> {
    const response = await this.request<SendMediaGroupResponse>('sendMediaGroup', params);
    return response.result!;
  }

  /**
   * Send point on the map
   */
  async sendLocation(params: SendLocationParams): Promise<SendLocationResponse> {
    const response = await this.request<SendLocationResponse>('sendLocation', params);
    return response.result!;
  }

  /**
   * Edit live location messages
   */
  async editMessageLiveLocation(params: EditMessageLiveLocationParams): Promise<EditMessageLiveLocationResponse> {
    const response = await this.request<EditMessageLiveLocationResponse>('editMessageLiveLocation', params);
    return response.result!;
  }

  /**
   * Stop updating a live location message
   */
  async stopMessageLiveLocation(params: StopMessageLiveLocationParams): Promise<StopMessageLiveLocationResponse> {
    const response = await this.request<StopMessageLiveLocationResponse>('stopMessageLiveLocation', params);
    return response.result!;
  }

  /**
   * Send information about a venue
   */
  async sendVenue(params: SendVenueParams): Promise<SendVenueResponse> {
    const response = await this.request<SendVenueResponse>('sendVenue', params);
    return response.result!;
  }

  /**
   * Send phone contacts
   */
  async sendContact(params: SendContactParams): Promise<SendContactResponse> {
    const response = await this.request<SendContactResponse>('sendContact', params);
    return response.result!;
  }

  /**
   * Send a native poll
   */
  async sendPoll(params: SendPollParams): Promise<SendPollResponse> {
    const response = await this.request<SendPollResponse>('sendPoll', params);
    return response.result!;
  }

  /**
   * Send an animated emoji that will display a random value
   */
  async sendDice(params: SendDiceParams): Promise<SendDiceResponse> {
    const response = await this.request<SendDiceResponse>('sendDice', params);
    return response.result!;
  }

  /**
   * Tell the user that something is happening on the bot's side
   */
  async sendChatAction(params: SendChatActionParams): Promise<SendChatActionResponse> {
    const response = await this.request<SendChatActionResponse>('sendChatAction', params);
    return response.result!;
  }

  /**
   * Get a list of profile pictures for a user
   */
  async getUserProfilePhotos(params: GetUserProfilePhotosParams): Promise<GetUserProfilePhotosResponse> {
    const response = await this.request<GetUserProfilePhotosResponse>('getUserProfilePhotos', params);
    return response.result!;
  }

  /**
   * Get basic info about a file and prepare it for downloading
   */
  async getFile(params: GetFileParams): Promise<GetFileResponse> {
    const response = await this.request<GetFileResponse>('getFile', params);
    return response.result!;
  }

  /**
   * Ban a user in a group, a supergroup or a channel
   */
  async banChatMember(params: BanChatMemberParams): Promise<BanChatMemberResponse> {
    const response = await this.request<BanChatMemberResponse>('banChatMember', params);
    return response.result!;
  }

  /**
   * Unban a previously banned user in a supergroup or channel
   */
  async unbanChatMember(params: UnbanChatMemberParams): Promise<UnbanChatMemberResponse> {
    const response = await this.request<UnbanChatMemberResponse>('unbanChatMember', params);
    return response.result!;
  }

  /**
   * Receive incoming updates using long polling
   */
  async getUpdates(params?: GetUpdatesParams): Promise<GetUpdatesResponse> {
    const response = await this.request<GetUpdatesResponse>('getUpdates', params);
    return response.result!;
  }
}

export class TelegramError extends Error {
  constructor(message: string, public readonly code?: number) {
    super(message);
    this.name = 'TelegramError';
  }
}
