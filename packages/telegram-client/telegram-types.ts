// telegram-types.ts - Complete Telegram Bot API types

/**
 * This file contains the complete type definitions for the Telegram Bot API
 * Based on the official documentation: https://core.telegram.org/bots/api
 */

// Base Response Types
export interface ApiResponse<T> {
  ok: boolean;
  result?: T;
  error_code?: number;
  description?: string;
}

// Core Telegram Types
export interface User {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: true;
  added_to_attachment_menu?: true;
}

export interface Chat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_forum?: true;
}

export interface Message {
  message_id: number;
  message_thread_id?: number;
  from?: User;
  sender_chat?: Chat;
  date: number;
  chat: Chat;
  forward_from?: User;
  forward_from_chat?: Chat;
  forward_from_message_id?: number;
  forward_signature?: string;
  forward_sender_name?: string;
  forward_date?: number;
  is_topic_message?: true;
  is_automatic_forward?: true;
  reply_to_message?: Message;
  via_bot?: User;
  edit_date?: number;
  has_protected_content?: true;
  media_group_id?: string;
  author_signature?: string;
  text?: string;
  entities?: MessageEntity[];
  animation?: Animation;
  audio?: Audio;
  document?: Document;
  photo?: PhotoSize[];
  sticker?: Sticker;
  story?: Story;
  video?: Video;
  video_note?: VideoNote;
  voice?: Voice;
  caption?: string;
  caption_entities?: MessageEntity[];
  has_media_spoiler?: true;
  contact?: Contact;
  dice?: Dice;
  game?: Game;
  poll?: Poll;
  venue?: Venue;
  location?: Location;
  new_chat_members?: User[];
  left_chat_member?: User;
  new_chat_title?: string;
  new_chat_photo?: PhotoSize[];
  delete_chat_photo?: true;
  group_chat_created?: true;
  supergroup_chat_created?: true;
  channel_chat_created?: true;
  message_auto_delete_timer_changed?: MessageAutoDeleteTimerChanged;
  migrate_to_chat_id?: number;
  migrate_from_chat_id?: number;
  pinned_message?: Message;
  invoice?: Invoice;
  successful_payment?: SuccessfulPayment;
  user_shared?: UserShared;
  chat_shared?: ChatShared;
  connected_website?: string;
  write_access_allowed?: WriteAccessAllowed;
  passport_data?: PassportData;
  proximity_alert_triggered?: ProximityAlertTriggered;
  forum_topic_created?: ForumTopicCreated;
  forum_topic_edited?: ForumTopicEdited;
  forum_topic_closed?: ForumTopicClosed;
  forum_topic_reopened?: ForumTopicReopened;
  general_forum_topic_hidden?: GeneralForumTopicHidden;
  general_forum_topic_unhidden?: GeneralForumTopicUnhidden;
  giveaway_created?: Giveaway;
  giveaway?: Giveaway;
  giveaway_winners?: GiveawayWinners;
  giveaway_completed?: GiveawayCompleted;
  video_chat_scheduled?: VideoChatScheduled;
  video_chat_started?: VideoChatStarted;
  video_chat_ended?: VideoChatEnded;
  video_chat_participants_invited?: VideoChatParticipantsInvited;
  web_app_data?: WebAppData;
  reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
}

export interface MessageEntity {
  type: 'mention' | 'hashtag' | 'cashtag' | 'bot_command' | 'url' | 'email' | 'phone_number' | 'bold' | 'italic' | 'underline' | 'strikethrough' | 'spoiler' | 'code' | 'pre' | 'text_link' | 'text_mention' | 'custom_emoji';
  offset: number;
  length: number;
  url?: string;
  user?: User;
  language?: string;
  custom_emoji_id?: string;
}

export interface PhotoSize {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
}

export interface Animation {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  duration: number;
  thumb?: PhotoSize;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

export interface Audio {
  file_id: string;
  file_unique_id: string;
  duration: number;
  performer?: string;
  title?: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
  thumb?: PhotoSize;
}

export interface Document {
  file_id: string;
  file_unique_id: string;
  thumb?: PhotoSize;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

export interface Video {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  duration: number;
  thumb?: PhotoSize;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

export interface VideoNote {
  file_id: string;
  file_unique_id: string;
  length: number;
  duration: number;
  thumb?: PhotoSize;
  file_size?: number;
}

export interface Voice {
  file_id: string;
  file_unique_id: string;
  duration: number;
  mime_type?: string;
  file_size?: number;
}

export interface Contact {
  phone_number: string;
  first_name: string;
  last_name?: string;
  user_id?: number;
  vcard?: string;
}

export interface Dice {
  emoji: string;
  value: number;
}

export interface PollOption {
  text: string;
  voter_count: number;
}

export interface PollAnswer {
  poll_id: string;
  user: User;
  option_ids: number[];
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  total_voter_count: number;
  is_closed: boolean;
  is_anonymous: boolean;
  type: 'regular' | 'quiz';
  allows_multiple_answers: boolean;
  correct_option_id?: number;
  explanation?: string;
  explanation_entities?: MessageEntity[];
  open_period?: number;
  close_date?: number;
}

export interface Location {
  longitude: number;
  latitude: number;
  horizontal_accuracy?: number;
  live_period?: number;
  heading?: number;
  proximity_alert_radius?: number;
}

export interface Venue {
  location: Location;
  title: string;
  address: string;
  foursquare_id?: string;
  foursquare_type?: string;
  google_place_id?: string;
  google_place_type?: string;
}

export interface WebAppData {
  data: string;
  button_text: string;
}

export interface ProximityAlertTriggered {
  traveler: User;
  watcher: User;
  distance: number;
}

export interface MessageAutoDeleteTimerChanged {
  message_auto_delete_time: number;
}

export interface ForumTopicCreated {
  name: string;
  icon_color: number;
  icon_custom_emoji_id?: string;
}

export interface ForumTopicClosed {}

export interface ForumTopicEdited {
  name?: string;
  icon_custom_emoji_id?: string;
}

export interface ForumTopicReopened {}

export interface GeneralForumTopicHidden {}

export interface GeneralForumTopicUnhidden {}

export interface UserShared {
  request_id: number;
  user_id: number;
}

export interface ChatShared {
  request_id: number;
  chat_id: number;
}

export interface WriteAccessAllowed {
  from_request?: true;
  web_app_name?: string;
  from_attachment_menu?: true;
}

export interface VideoChatScheduled {
  start_date: number;
}

export interface VideoChatStarted {}

export interface VideoChatEnded {
  duration: number;
}

export interface VideoChatParticipantsInvited {
  users: User[];
}

export interface UserProfilePhotos {
  total_count: number;
  photos: PhotoSize[][];
}

export interface File {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  file_path?: string;
}

export interface WebAppInfo {
  url: string;
}

export interface ReplyKeyboardMarkup {
  keyboard: KeyboardButton[][];
  is_persistent?: boolean;
  resize_keyboard?: boolean;
  one_time_keyboard?: boolean;
  input_field_placeholder?: string;
  selective?: boolean;
}

export interface KeyboardButton {
  text: string;
  request_user?: KeyboardButtonRequestUser;
  request_chat?: KeyboardButtonRequestChat;
  request_contact?: boolean;
  request_location?: boolean;
  request_poll?: KeyboardButtonPollType;
  web_app?: WebAppInfo;
}

export interface KeyboardButtonRequestUser {
  request_id: number;
  user_is_bot?: boolean;
  user_is_premium?: boolean;
}

export interface KeyboardButtonRequestChat {
  request_id: number;
  chat_is_channel: boolean;
  chat_is_forum?: boolean;
  chat_has_username?: boolean;
  chat_is_created?: boolean;
  user_administrator_rights?: ChatAdministratorRights;
  bot_administrator_rights?: ChatAdministratorRights;
  bot_is_member?: boolean;
}

export interface KeyboardButtonPollType {
  type?: 'quiz' | 'regular';
}

export interface ReplyKeyboardRemove {
  remove_keyboard: true;
  selective?: boolean;
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

export interface InlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
  web_app?: WebAppInfo;
  login_url?: LoginUrl;
  switch_inline_query?: string;
  switch_inline_query_current_chat?: string;
  switch_inline_query_chosen_chat?: SwitchInlineQueryChosenChat;
  callback_game?: CallbackGame;
  pay?: boolean;
}

export interface LoginUrl {
  url: string;
  forward_text?: string;
  bot_username?: string;
  request_write_access?: boolean;
}

export interface SwitchInlineQueryChosenChat {
  query?: string;
  allow_user_chats?: boolean;
  allow_bot_chats?: boolean;
  allow_group_chats?: boolean;
  allow_channel_chats?: boolean;
}

export interface CallbackQuery {
  id: string;
  from: User;
  message?: Message;
  inline_message_id?: string;
  chat_instance: string;
  data?: string;
  game_short_name?: string;
}

export interface ForceReply {
  force_reply: true;
  input_field_placeholder?: string;
  selective?: boolean;
}

export interface ChatPhoto {
  small_file_id: string;
  small_file_unique_id: string;
  big_file_id: string;
  big_file_unique_id: string;
}

export interface ChatInviteLink {
  invite_link: string;
  creator: User;
  creates_join_request: boolean;
  is_primary: boolean;
  is_revoked: boolean;
  name?: string;
  expire_date?: number;
  member_limit?: number;
  pending_join_request_count?: number;
}

export interface ChatAdministratorRights {
  is_anonymous: boolean;
  can_manage_chat: boolean;
  can_delete_messages: boolean;
  can_manage_video_chats: boolean;
  can_restrict_members: boolean;
  can_promote_members: boolean;
  can_change_info: boolean;
  can_invite_users: boolean;
  can_post_messages?: boolean;
  can_edit_messages?: boolean;
  can_pin_messages?: boolean;
  can_post_stories?: boolean;
  can_edit_stories?: boolean;
  can_delete_stories?: boolean;
  can_manage_topics?: boolean;
}

export interface ChatMember {
  status: 'creator' | 'administrator' | 'member' | 'restricted' | 'left' | 'kicked';
  user: User;
}

export interface ChatMemberOwner extends ChatMember {
  status: 'creator';
  is_anonymous: boolean;
  custom_title?: string;
}

export interface ChatMemberAdministrator extends ChatMember {
  status: 'administrator';
  can_be_edited: boolean;
  is_anonymous: boolean;
  can_manage_chat: boolean;
  can_delete_messages: boolean;
  can_manage_video_chats: boolean;
  can_restrict_members: boolean;
  can_promote_members: boolean;
  can_change_info: boolean;
  can_invite_users: boolean;
  can_post_messages?: boolean;
  can_edit_messages?: boolean;
  can_pin_messages?: boolean;
  can_post_stories?: boolean;
  can_edit_stories?: boolean;
  can_delete_stories?: boolean;
  can_manage_topics?: boolean;
  custom_title?: string;
}

export interface ChatMemberMember extends ChatMember {
  status: 'member';
}

export interface ChatMemberRestricted extends ChatMember {
  status: 'restricted';
  is_member: boolean;
  can_send_messages: boolean;
  can_send_audios: boolean;
  can_send_documents: boolean;
  can_send_photos: boolean;
  can_send_videos: boolean;
  can_send_video_notes: boolean;
  can_send_voice_notes: boolean;
  can_send_polls: boolean;
  can_send_other_messages: boolean;
  can_add_web_page_previews: boolean;
  can_change_info: boolean;
  can_invite_users: boolean;
  can_pin_messages: boolean;
  can_manage_topics: boolean;
  until_date: number;
}

export interface ChatMemberLeft extends ChatMember {
  status: 'left';
}

export interface ChatMemberBanned extends ChatMember {
  status: 'kicked';
  until_date: number;
}

export interface ChatMemberUpdated {
  chat: Chat;
  from: User;
  date: number;
  old_chat_member: ChatMember;
  new_chat_member: ChatMember;
  invite_link?: ChatInviteLink;
  via_chat_folder_invite_link?: boolean;
}

export interface ChatJoinRequest {
  chat: Chat;
  from: User;
  user_chat_id: number;
  date: number;
  bio?: string;
  invite_link?: ChatInviteLink;
}

export interface ChatPermissions {
  can_send_messages?: boolean;
  can_send_audios?: boolean;
  can_send_documents?: boolean;
  can_send_photos?: boolean;
  can_send_videos?: boolean;
  can_send_video_notes?: boolean;
  can_send_voice_notes?: boolean;
  can_send_polls?: boolean;
  can_send_other_messages?: boolean;
  can_add_web_page_previews?: boolean;
  can_change_info?: boolean;
  can_invite_users?: boolean;
  can_pin_messages?: boolean;
  can_manage_topics?: boolean;
}

export interface ChatLocation {
  location: Location;
  address: string;
}

export interface ForumTopic {
  message_thread_id: number;
  name: string;
  icon_color: number;
  icon_custom_emoji_id?: string;
}

export interface BotCommand {
  command: string;
  description: string;
}

export interface BotCommandScope {
  type: string;
}

export interface BotCommandScopeDefault extends BotCommandScope {
  type: 'default';
}

export interface BotCommandScopeAllPrivateChats extends BotCommandScope {
  type: 'all_private_chats';
}

export interface BotCommandScopeAllGroupChats extends BotCommandScope {
  type: 'all_group_chats';
}

export interface BotCommandScopeAllChatAdministrators extends BotCommandScope {
  type: 'all_chat_administrators';
}

export interface BotCommandScopeChat extends BotCommandScope {
  type: 'chat';
  chat_id: number | string;
}

export interface BotCommandScopeChatAdministrators extends BotCommandScope {
  type: 'chat_administrators';
  chat_id: number | string;
}

export interface BotCommandScopeChatMember extends BotCommandScope {
  type: 'chat_member';
  chat_id: number | string;
  user_id: number;
}

export interface BotName {
  name: string;
}

export interface BotDescription {
  description: string;
}

export interface BotShortDescription {
  short_description: string;
}

export interface MenuButton {
  type: string;
}

export interface MenuButtonCommands extends MenuButton {
  type: 'commands';
}

export interface MenuButtonWebApp extends MenuButton {
  type: 'web_app';
  text: string;
  web_app: WebAppInfo;
}

export interface MenuButtonDefault extends MenuButton {
  type: 'default';
}

export interface ResponseParameters {
  migrate_to_chat_id?: number;
  retry_after?: number;
}

export interface InputMedia {
  type: string;
  media: string;
  caption?: string;
  parse_mode?: string;
  caption_entities?: MessageEntity[];
}

export interface InputMediaPhoto extends InputMedia {
  type: 'photo';
  has_spoiler?: boolean;
}

export interface InputMediaVideo extends InputMedia {
  type: 'video';
  thumb?: string;
  width?: number;
  height?: number;
  duration?: number;
  supports_streaming?: boolean;
  has_spoiler?: boolean;
}

export interface InputMediaAnimation extends InputMedia {
  type: 'animation';
  thumb?: string;
  width?: number;
  height?: number;
  duration?: number;
  has_spoiler?: boolean;
}

export interface InputMediaAudio extends InputMedia {
  type: 'audio';
  thumb?: string;
  duration?: number;
  performer?: string;
  title?: string;
}

export interface InputMediaDocument extends InputMedia {
  type: 'document';
  thumb?: string;
  disable_content_type_detection?: boolean;
}

export interface Sticker {
  file_id: string;
  file_unique_id: string;
  type: 'regular' | 'mask' | 'custom_emoji';
  width: number;
  height: number;
  is_animated: boolean;
  is_video: boolean;
  thumb?: PhotoSize;
  emoji?: string;
  set_name?: string;
  premium_animation?: File;
  mask_position?: MaskPosition;
  custom_emoji_id?: string;
  needs_repainting?: boolean;
  file_size?: number;
}

export interface StickerSet {
  name: string;
  title: string;
  sticker_type: 'regular' | 'mask' | 'custom_emoji';
  is_animated: boolean;
  is_video: boolean;
  stickers: Sticker[];
  thumb?: PhotoSize;
}

export interface MaskPosition {
  point: 'forehead' | 'eyes' | 'mouth' | 'chin';
  x_shift: number;
  y_shift: number;
  scale: number;
}

export interface InputSticker {
  sticker: string;
  emoji_list: string[];
  mask_position?: MaskPosition;
  keywords?: string[];
}

export interface Story {
  chat: Chat;
  id: number;
}

export interface Game {
  title: string;
  description: string;
  photo: PhotoSize[];
  text?: string;
  text_entities?: MessageEntity[];
  animation?: Animation;
}

export interface GameHighScore {
  position: number;
  user: User;
  score: number;
}

export interface Giveaway {
  chats: Chat[];
  winners_selection_date: number;
  winner_count: number;
  only_new_members?: true;
  has_public_winners?: true;
  prize_description?: string;
  country_codes?: string[];
  premium_subscription_month_count?: number;
}

export interface GiveawayWinners {
  chat: Chat;
  giveaway_message_id: number;
  winners_selection_date: number;
  winner_count: number;
  winners: User[];
  additional_chat_count?: number;
  premium_subscription_month_count?: number;
  unclaimed_prize_count?: number;
  only_new_members?: true;
  was_refunded?: true;
  prize_description?: string;
}

export interface GiveawayCompleted {
  winner_count: number;
  unclaimed_prize_count?: number;
  giveaway_message?: Message;
}

export interface Invoice {
  title: string;
  description: string;
  start_parameter: string;
  currency: string;
  total_amount: number;
}

export interface SuccessfulPayment {
  currency: string;
  total_amount: number;
  invoice_payload: string;
  shipping_option_id?: string;
  order_info?: OrderInfo;
  telegram_payment_charge_id: string;
  provider_payment_charge_id: string;
}

export interface ShippingAddress {
  country_code: string;
  state: string;
  city: string;
  street_line1: string;
  street_line2: string;
  post_code: string;
}

export interface OrderInfo {
  name?: string;
  phone_number?: string;
  email?: string;
  shipping_address?: ShippingAddress;
}

export interface ShippingOption {
  id: string;
  title: string;
  prices: LabeledPrice[];
}

export interface SuccessfulPayment {
  currency: string;
  total_amount: number;
  invoice_payload: string;
  shipping_option_id?: string;
  order_info?: OrderInfo;
  telegram_payment_charge_id: string;
  provider_payment_charge_id: string;
}

export interface PassportData {
  data: EncryptedPassportElement[];
  credentials: EncryptedCredentials;
}

export interface PassportFile {
  file_id: string;
  file_unique_id: string;
  file_size: number;
  file_date: number;
}

export interface EncryptedPassportElement {
  type: 'personal_details' | 'passport' | 'driver_license' | 'identity_card' | 'internal_passport' | 'address' | 'utility_bill' | 'bank_statement' | 'rental_agreement' | 'passport_registration' | 'temporary_registration' | 'phone_number' | 'email';
  data?: string;
  phone_number?: string;
  email?: string;
  files?: PassportFile[];
  front_side?: PassportFile;
  reverse_side?: PassportFile;
  selfie?: PassportFile;
  translation?: PassportFile[];
  hash: string;
}

export interface EncryptedCredentials {
  data: string;
  hash: string;
  secret: string;
}

export interface LabeledPrice {
  label: string;
  amount: number;
}

export interface ShippingQuery {
  id: string;
  from: User;
  invoice_payload: string;
  shipping_address: ShippingAddress;
}

export interface PreCheckoutQuery {
  id: string;
  from: User;
  currency: string;
  total_amount: number;
  invoice_payload: string;
  shipping_option_id?: string;
  order_info?: OrderInfo;
}

export interface PaidMediaInfo {
  star_count: number;
  paid_media: PaidMedia[];
}

export interface PaidMedia {
  type: string;
}

export interface PaidMediaPreview extends PaidMedia {
  type: 'preview';
  width?: number;
  height?: number;
  duration?: number;
}

export interface PaidMediaPhoto extends PaidMedia {
  type: 'photo';
  photo: PhotoSize[];
}

export interface PaidMediaVideo extends PaidMedia {
  type: 'video';
  video: Video;
}

export interface PurchasedPaidMedia {
  from: User;
  paid_media: PaidMediaInfo;
}

export interface StarTransactions {
  transactions: StarTransaction[];
}

export interface StarTransaction {
  id: string;
  amount: number;
  date: number;
  source?: TransactionPartner;
  receiver?: TransactionPartner;
}

export interface TransactionPartner {
  type: string;
}

export interface TransactionPartnerUser extends TransactionPartner {
  type: 'user';
  user: User;
  invoice_payload?: string;
}

export interface TransactionPartnerFragment extends TransactionPartner {
  type: 'fragment';
  withdrawal_state?: RevenueWithdrawalState;
}

export interface TransactionPartnerTelegramAds extends TransactionPartner {
  type: 'telegram_ads';
}

export interface TransactionPartnerOther extends TransactionPartner {
  type: 'other';
}

export interface RevenueWithdrawalState {
  type: string;
}

export interface RevenueWithdrawalStatePending extends RevenueWithdrawalState {
  type: 'pending';
}

export interface RevenueWithdrawalStateSucceeded extends RevenueWithdrawalState {
  type: 'succeeded';
  date: number;
  url: string;
}

export interface RevenueWithdrawalStateFailed extends RevenueWithdrawalState {
  type: 'failed';
}

export interface StickerSet {
  name: string;
  title: string;
  sticker_type: 'regular' | 'mask' | 'custom_emoji';
  is_animated: boolean;
  is_video: boolean;
  stickers: Sticker[];
  thumb?: PhotoSize;
}

// Update Types
export interface Update {
  update_id: number;
  message?: Message;
  edited_message?: Message;
  channel_post?: Message;
  edited_channel_post?: Message;
  business_connection?: BusinessConnection;
  business_message?: Message;
  edited_business_message?: Message;
  deleted_business_messages?: BusinessMessagesDeleted;
  message_reaction?: MessageReactionUpdated;
  message_reaction_count?: MessageReactionCountUpdated;
  inline_query?: InlineQuery;
  chosen_inline_result?: ChosenInlineResult;
  callback_query?: CallbackQuery;
  shipping_query?: ShippingQuery;
  pre_checkout_query?: PreCheckoutQuery;
  purchased_paid_media?: PurchasedPaidMedia;
  poll?: Poll;
  poll_answer?: PollAnswer;
  my_chat_member?: ChatMemberUpdated;
  chat_member?: ChatMemberUpdated;
  chat_join_request?: ChatJoinRequest;
  chat_boost?: ChatBoostUpdated;
  removed_chat_boost?: ChatBoostRemoved;
}

export interface WebhookInfo {
  url: string;
  has_custom_certificate: boolean;
  pending_update_count: number;
  ip_address?: string;
  last_error_date?: number;
  last_error_message?: string;
  last_synchronization_error_date?: number;
  max_connections?: number;
  allowed_updates?: string[];
}

export interface BusinessConnection {
  id: string;
  user: User;
  user_chat_id: number;
  date: number;
  can_reply: boolean;
  is_enabled: boolean;
}

export interface BusinessMessagesDeleted {
  business_connection_id: string;
  chat: Chat;
  message_ids: number[];
}

export interface MessageReactionUpdated {
  chat: Chat;
  message_id: number;
  user?: User;
  actor_chat?: Chat;
  date: number;
  old_reaction: ReactionType[];
  new_reaction: ReactionType[];
}

export interface MessageReactionCountUpdated {
  chat: Chat;
  message_id: number;
  date: number;
  reactions: ReactionCount[];
}

export interface ReactionType {
  type: string;
}

export interface ReactionTypeEmoji extends ReactionType {
  type: 'emoji';
  emoji: string;
}

export interface ReactionTypeCustomEmoji extends ReactionType {
  type: 'custom_emoji';
  custom_emoji_id: string;
}

export interface ReactionCount {
  type: ReactionType;
  total_count: number;
}

export interface ChatBoost {
  boost_id: string;
  add_date: number;
  expiration_date: number;
  source: ChatBoostSource;
}

export interface ChatBoostSource {
  source: string;
}

export interface ChatBoostSourcePremium extends ChatBoostSource {
  source: 'premium';
  user: User;
}

export interface ChatBoostSourceGiftCode extends ChatBoostSource {
  source: 'gift_code';
  user: User;
}

export interface ChatBoostSourceGiveaway extends ChatBoostSource {
  source: 'giveaway';
  giveaway_message_id: number;
  user?: User;
  is_unclaimed?: true;
}

export interface ChatBoostUpdated {
  chat: Chat;
  boost: ChatBoost;
}

export interface ChatBoostRemoved {
  chat: Chat;
  boost_id: string;
  remove_date: number;
  source: ChatBoostSource;
}

export interface UserChatBoosts {
  boosts: ChatBoost[];
}

export interface InlineQuery {
  id: string;
  from: User;
  query: string;
  offset: string;
  chat_type?: 'sender' | 'private' | 'group' | 'supergroup' | 'channel';
  location?: Location;
}

export interface ChosenInlineResult {
  result_id: string;
  from: User;
  location?: Location;
  inline_message_id?: string;
  query: string;
}

export interface CallbackGame {}

export interface SentWebAppMessage {
  inline_message_id?: string;
}

// Method Parameters
export interface GetMeResponse extends User {}

export interface SendMessageParams {
  chat_id: number | string;
  message_thread_id?: number;
  text: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  entities?: MessageEntity[];
  disable_web_page_preview?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
}

export interface SendMessageResponse extends Message {}

export interface ForwardMessageParams {
  chat_id: number | string;
  message_thread_id?: number;
  from_chat_id: number | string;
  disable_notification?: boolean;
  protect_content?: boolean;
  message_id: number;
}

export interface ForwardMessageResponse extends Message {}

export interface CopyMessageParams {
  chat_id: number | string;
  message_thread_id?: number;
  from_chat_id: number | string;
  message_id: number;
  caption?: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  caption_entities?: MessageEntity[];
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
}

export interface CopyMessageResponse {
  message_id: number;
}

export interface SendPhotoParams {
  chat_id: number | string;
  message_thread_id?: number;
  photo: string;
  caption?: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  caption_entities?: MessageEntity[];
  has_spoiler?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
}

export interface SendPhotoResponse extends Message {}

export interface SendAudioParams {
  chat_id: number | string;
  message_thread_id?: number;
  audio: string;
  caption?: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  caption_entities?: MessageEntity[];
  duration?: number;
  performer?: string;
  title?: string;
  thumb?: string;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
}

export interface SendAudioResponse extends Message {}

export interface SendDocumentParams {
  chat_id: number | string;
  message_thread_id?: number;
  document: string;
  thumb?: string;
  caption?: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  caption_entities?: MessageEntity[];
  disable_content_type_detection?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
}

export interface SendDocumentResponse extends Message {}

export interface SendVideoParams {
  chat_id: number | string;
  message_thread_id?: number;
  video: string;
  duration?: number;
  width?: number;
  height?: number;
  thumb?: string;
  caption?: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  caption_entities?: MessageEntity[];
  has_spoiler?: boolean;
  supports_streaming?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
}

export interface SendVideoResponse extends Message {}

export interface SendAnimationParams {
  chat_id: number | string;
  message_thread_id?: number;
  animation: string;
  duration?: number;
  width?: number;
  height?: number;
  thumb?: string;
  caption?: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  caption_entities?: MessageEntity[];
  has_spoiler?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
}

export interface SendAnimationResponse extends Message {}

export interface SendVoiceParams {
  chat_id: number | string;
  message_thread_id?: number;
  voice: string;
  caption?: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  caption_entities?: MessageEntity[];
  duration?: number;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
}

export interface SendVoiceResponse extends Message {}

export interface SendVideoNoteParams {
  chat_id: number | string;
  message_thread_id?: number;
  video_note: string;
  duration?: number;
  length?: number;
  thumb?: string;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
}

export interface SendVideoNoteResponse extends Message {}

export interface SendMediaGroupParams {
  chat_id: number | string;
  message_thread_id?: number;
  media: (InputMediaPhoto | InputMediaVideo)[];
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
}

export interface SendMediaGroupResponse extends Array<Message> {}

export interface SendLocationParams {
  chat_id: number | string;
  message_thread_id?: number;
  latitude: number;
  longitude: number;
  horizontal_accuracy?: number;
  live_period?: number;
  heading?: number;
  proximity_alert_radius?: number;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
}

export interface SendLocationResponse extends Message {}

export interface EditMessageLiveLocationParams {
  chat_id?: number | string;
  message_id?: number;
  inline_message_id?: string;
  latitude: number;
  longitude: number;
  live_period?: number;
  horizontal_accuracy?: number;
  heading?: number;
  proximity_alert_radius?: number;
  reply_markup?: InlineKeyboardMarkup;
}

export type EditMessageLiveLocationResponse = Message | boolean;

export interface StopMessageLiveLocationParams {
  chat_id?: number | string;
  message_id?: number;
  inline_message_id?: string;
  reply_markup?: InlineKeyboardMarkup;
}

export type StopMessageLiveLocationResponse = Message | boolean;

export interface SendVenueParams {
  chat_id: number | string;
  message_thread_id?: number;
  latitude: number;
  longitude: number;
  title: string;
  address: string;
  foursquare_id?: string;
  foursquare_type?: string;
  google_place_id?: string;
  google_place_type?: string;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
}

export interface SendVenueResponse extends Message {}

export interface SendContactParams {
  chat_id: number | string;
  message_thread_id?: number;
  phone_number: string;
  first_name: string;
  last_name?: string;
  vcard?: string;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
}

export interface SendContactResponse extends Message {}

export interface SendPollParams {
  chat_id: number | string;
  message_thread_id?: number;
  question: string;
  options: string[];
  is_anonymous?: boolean;
  type?: 'regular' | 'quiz';
  allows_multiple_answers?: boolean;
  correct_option_id?: number;
  explanation?: string;
  explanation_parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  explanation_entities?: MessageEntity[];
  open_period?: number;
  close_date?: number;
  is_closed?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
}

export interface SendPollResponse extends Message {}

export interface SendDiceParams {
  chat_id: number | string;
  message_thread_id?: number;
  emoji?: '🎲' | '🎯' | '🏀' | '⚽' | '🎳' | '🎰';
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
}

export interface SendDiceResponse extends Message {}

export interface SendChatActionParams {
  chat_id: number | string;
  message_thread_id?: number;
  action: 'typing' | 'upload_photo' | 'record_video' | 'upload_video' | 'record_voice' | 'upload_voice' | 'upload_document' | 'find_location' | 'record_video_note' | 'upload_video_note';
}

export type SendChatActionResponse = boolean;

export interface GetUserProfilePhotosParams {
  user_id: number;
  offset?: number;
  limit?: number;
}

export interface GetUserProfilePhotosResponse extends UserProfilePhotos {}

export interface GetFileParams {
  file_id: string;
}

export interface GetFileResponse extends File {}

export interface BanChatMemberParams {
  chat_id: number | string;
  user_id: number;
  until_date?: number;
  revoke_messages?: boolean;
}

export type BanChatMemberResponse = boolean;

export interface UnbanChatMemberParams {
  chat_id: number | string;
  user_id: number;
  only_if_banned?: boolean;
}

export type UnbanChatMemberResponse = boolean;

export interface RestrictChatMemberParams {
  chat_id: number | string;
  user_id: number;
  permissions: ChatPermissions;
  use_independent_chat_permissions?: boolean;
  until_date?: number;
}

export type RestrictChatMemberResponse = boolean;

export interface PromoteChatMemberParams {
  chat_id: number | string;
  user_id: number;
  is_anonymous?: boolean;
  can_manage_chat?: boolean;
  can_post_messages?: boolean;
  can_edit_messages?: boolean;
  can_delete_messages?: boolean;
  can_manage_video_chats?: boolean;
  can_restrict_members?: boolean;
  can_promote_members?: boolean;
  can_change_info?: boolean;
  can_invite_users?: boolean;
  can_pin_messages?: boolean;
  can_post_stories?: boolean;
  can_edit_stories?: boolean;
  can_delete_stories?: boolean;
  can_manage_topics?: boolean;
}

export type PromoteChatMemberResponse = boolean;

export interface SetChatAdministratorCustomTitleParams {
  chat_id: number | string;
  user_id: number;
  custom_title: string;
}

export type SetChatAdministratorCustomTitleResponse = boolean;

export interface BanChatSenderChatParams {
  chat_id: number | string;
  sender_chat_id: number;
}

export type BanChatSenderChatResponse = boolean;

export interface UnbanChatSenderChatParams {
  chat_id: number | string;
  sender_chat_id: number;
}

export type UnbanChatSenderChatResponse = boolean;

export interface SetChatPermissionsParams {
  chat_id: number | string;
  permissions: ChatPermissions;
  use_independent_chat_permissions?: boolean;
}

export type SetChatPermissionsResponse = boolean;

export interface ExportChatInviteLinkParams {
  chat_id: number | string;
}

export type ExportChatInviteLinkResponse = string;

export interface CreateChatInviteLinkParams {
  chat_id: number | string;
  name?: string;
  expire_date?: number;
  member_limit?: number;
  creates_join_request?: boolean;
}

export interface CreateChatInviteLinkResponse extends ChatInviteLink {}

export interface EditChatInviteLinkParams {
  chat_id: number | string;
  invite_link: string;
  name?: string;
  expire_date?: number;
  member_limit?: number;
  creates_join_request?: boolean;
}

export interface EditChatInviteLinkResponse extends ChatInviteLink {}

export interface RevokeChatInviteLinkParams {
  chat_id: number | string;
  invite_link: string;
}

export interface RevokeChatInviteLinkResponse extends ChatInviteLink {}

export interface ApproveChatJoinRequestParams {
  chat_id: number | string;
  user_id: number;
}

export type ApproveChatJoinRequestResponse = boolean;

export interface DeclineChatJoinRequestParams {
  chat_id: number | string;
  user_id: number;
}

export type DeclineChatJoinRequestResponse = boolean;

export interface SetChatPhotoParams {
  chat_id: number | string;
  photo: string;
}

export type SetChatPhotoResponse = boolean;

export interface DeleteChatPhotoParams {
  chat_id: number | string;
}

export type DeleteChatPhotoResponse = boolean;

export interface SetChatTitleParams {
  chat_id: number | string;
  title: string;
}

export type SetChatTitleResponse = boolean;

export interface SetChatDescriptionParams {
  chat_id: number | string;
  description?: string;
}

export type SetChatDescriptionResponse = boolean;

export interface PinChatMessageParams {
  chat_id: number | string;
  message_id: number;
  disable_notification?: boolean;
}

export type PinChatMessageResponse = boolean;

export interface UnpinChatMessageParams {
  chat_id: number | string;
  message_id?: number;
}

export type UnpinChatMessageResponse = boolean;

export interface UnpinAllChatMessagesParams {
  chat_id: number | string;
}

export type UnpinAllChatMessagesResponse = boolean;

export interface LeaveChatParams {
  chat_id: number | string;
}

export type LeaveChatResponse = boolean;

export interface GetChatParams {
  chat_id: number | string;
}

export interface GetChatResponse extends Chat {}

export interface GetChatAdministratorsParams {
  chat_id: number | string;
}

export interface GetChatAdministratorsResponse extends Array<ChatMember> {}

export interface GetChatMemberCountParams {
  chat_id: number | string;
}

export type GetChatMemberCountResponse = number;

export interface GetChatMemberParams {
  chat_id: number | string;
  user_id: number;
}

export interface GetChatMemberResponse extends ChatMember {}

export interface SetChatStickerSetParams {
  chat_id: number | string;
  sticker_set_name: string;
}

export type SetChatStickerSetResponse = boolean;

export interface DeleteChatStickerSetParams {
  chat_id: number | string;
}

export type DeleteChatStickerSetResponse = boolean;

export interface GetForumTopicIconStickersResponse extends Array<Sticker> {}

export interface CreateForumTopicParams {
  chat_id: number | string;
  name: string;
  icon_color?: number;
  icon_custom_emoji_id?: string;
}

export interface CreateForumTopicResponse extends ForumTopic {}

export interface EditForumTopicParams {
  chat_id: number | string;
  message_thread_id: number;
  name?: string;
  icon_custom_emoji_id?: string;
}

export type EditForumTopicResponse = boolean;

export interface CloseForumTopicParams {
  chat_id: number | string;
  message_thread_id: number;
}

export type CloseForumTopicResponse = boolean;

export interface ReopenForumTopicParams {
  chat_id: number | string;
  message_thread_id: number;
}

export type ReopenForumTopicResponse = boolean;

export interface DeleteForumTopicParams {
  chat_id: number | string;
  message_thread_id: number;
}

export type DeleteForumTopicResponse = boolean;

export interface UnpinAllForumTopicMessagesParams {
  chat_id: number | string;
  message_thread_id: number;
}

export type UnpinAllForumTopicMessagesResponse = boolean;

export interface EditGeneralForumTopicParams {
  chat_id: number | string;
  name: string;
}

export type EditGeneralForumTopicResponse = boolean;

export interface CloseGeneralForumTopicParams {
  chat_id: number | string;
}

export type CloseGeneralForumTopicResponse = boolean;

export interface ReopenGeneralForumTopicParams {
  chat_id: number | string;
}

export type ReopenGeneralForumTopicResponse = boolean;

export interface HideGeneralForumTopicParams {
  chat_id: number | string;
}

export type HideGeneralForumTopicResponse = boolean;

export interface UnhideGeneralForumTopicParams {
  chat_id: number | string;
}

export type UnhideGeneralForumTopicResponse = boolean;

export interface AnswerCallbackQueryParams {
  callback_query_id: string;
  text?: string;
  show_alert?: boolean;
  url?: string;
  cache_time?: number;
}

export type AnswerCallbackQueryResponse = boolean;

export interface SetMyCommandsParams {
  commands: BotCommand[];
  scope?: BotCommandScope;
  language_code?: string;
}

export type SetMyCommandsResponse = boolean;

export interface DeleteMyCommandsParams {
  scope?: BotCommandScope;
  language_code?: string;
}

export type DeleteMyCommandsResponse = boolean;

export interface GetMyCommandsParams {
  scope?: BotCommandScope;
  language_code?: string;
}

export interface GetMyCommandsResponse extends Array<BotCommand> {}

export interface SetMyNameParams {
  name?: string;
  language_code?: string;
}

export type SetMyNameResponse = boolean;

export interface GetMyNameParams {
  language_code?: string;
}

export interface GetMyNameResponse extends BotName {}

export interface SetMyDescriptionParams {
  description?: string;
  language_code?: string;
}

export type SetMyDescriptionResponse = boolean;

export interface GetMyDescriptionParams {
  language_code?: string;
}

export interface GetMyDescriptionResponse extends BotDescription {}

export interface SetMyShortDescriptionParams {
  short_description?: string;
  language_code?: string;
}

export type SetMyShortDescriptionResponse = boolean;

export interface GetMyShortDescriptionParams {
  language_code?: string;
}

export interface GetMyShortDescriptionResponse extends BotShortDescription {}

export interface SetChatMenuButtonParams {
  chat_id?: number;
  menu_button?: MenuButton;
}

export type SetChatMenuButtonResponse = boolean;

export interface GetChatMenuButtonParams {
  chat_id?: number;
}

export interface GetChatMenuButtonResponse extends MenuButton {}

export interface SetMyDefaultAdministratorRightsParams {
  rights?: ChatAdministratorRights;
  for_channels?: boolean;
}

export type SetMyDefaultAdministratorRightsResponse = boolean;

export interface GetMyDefaultAdministratorRightsParams {
  for_channels?: boolean;
}

export interface GetMyDefaultAdministratorRightsResponse extends ChatAdministratorRights {}

export interface EditMessageTextParams {
  chat_id?: number | string;
  message_id?: number;
  inline_message_id?: string;
  text: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  entities?: MessageEntity[];
  disable_web_page_preview?: boolean;
  reply_markup?: InlineKeyboardMarkup;
}

export type EditMessageTextResponse = Message | boolean;

export interface EditMessageCaptionParams {
  chat_id?: number | string;
  message_id?: number;
  inline_message_id?: string;
  caption?: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  caption_entities?: MessageEntity[];
  reply_markup?: InlineKeyboardMarkup;
}

export type EditMessageCaptionResponse = Message | boolean;

export interface EditMessageMediaParams {
  chat_id?: number | string;
  message_id?: number;
  inline_message_id?: string;
  media: InputMedia;
  reply_markup?: InlineKeyboardMarkup;
}

export type EditMessageMediaResponse = Message | boolean;

export interface EditMessageReplyMarkupParams {
  chat_id?: number | string;
  message_id?: number;
  inline_message_id?: string;
  reply_markup?: InlineKeyboardMarkup;
}

export type EditMessageReplyMarkupResponse = Message | boolean;

export interface StopPollParams {
  chat_id: number | string;
  message_id: number;
  reply_markup?: InlineKeyboardMarkup;
}

export interface StopPollResponse extends Poll {}

export interface DeleteMessageParams {
  chat_id: number | string;
  message_id: number;
}

export type DeleteMessageResponse = boolean;

export interface DeleteMessagesParams {
  chat_id: number | string;
  message_ids: number[];
}

export type DeleteMessagesResponse = boolean;

export interface SendStickerParams {
  chat_id: number | string;
  message_thread_id?: number;
  sticker: string;
  emoji?: string;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
}

export interface SendStickerResponse extends Message {}

export interface GetStickerSetParams {
  name: string;
}

export interface GetStickerSetResponse extends StickerSet {}

export interface GetCustomEmojiStickersParams {
  custom_emoji_ids: string[];
}

export interface GetCustomEmojiStickersResponse extends Array<Sticker> {}

export interface UploadStickerFileParams {
  user_id: number;
  sticker: string;
  sticker_format: 'static' | 'animated' | 'video';
}

export interface UploadStickerFileResponse extends File {}

export interface CreateNewStickerSetParams {
  user_id: number;
  name: string;
  title: string;
  stickers: InputSticker[];
  sticker_type?: 'regular' | 'mask' | 'custom_emoji';
  needs_repainting?: boolean;
}

export type CreateNewStickerSetResponse = boolean;

export interface AddStickerToSetParams {
  user_id: number;
  name: string;
  sticker: InputSticker;
}

export type AddStickerToSetResponse = boolean;

export interface SetStickerPositionInSetParams {
  sticker: string;
  position: number;
}

export type SetStickerPositionInSetResponse = boolean;

export interface DeleteStickerFromSetParams {
  sticker: string;
}

export type DeleteStickerFromSetResponse = boolean;

export interface SetStickerEmojiListParams {
  sticker: string;
  emoji_list: string[];
}

export type SetStickerEmojiListResponse = boolean;

export interface SetStickerKeywordsParams {
  sticker: string;
  keywords?: string[];
}

export type SetStickerKeywordsResponse = boolean;

export interface SetStickerMaskPositionParams {
  sticker: string;
  mask_position?: MaskPosition;
}

export type SetStickerMaskPositionResponse = boolean;

export interface SetStickerSetTitleParams {
  name: string;
  title: string;
}

export type SetStickerSetTitleResponse = boolean;

export interface SetStickerSetThumbnailParams {
  name: string;
  user_id: number;
  thumbnail?: string;
}

export type SetStickerSetThumbnailResponse = boolean;

export interface SetCustomEmojiStickerSetThumbnailParams {
  name: string;
  custom_emoji_id?: string;
}

export type SetCustomEmojiStickerSetThumbnailResponse = boolean;

export interface DeleteStickerSetParams {
  name: string;
}

export type DeleteStickerSetResponse = boolean;

export interface AnswerInlineQueryParams {
  inline_query_id: string;
  results: InlineQueryResult[];
  cache_time?: number;
  is_personal?: boolean;
  next_offset?: string;
  button?: InlineQueryResultsButton;
}

export type AnswerInlineQueryResponse = boolean;

export interface InlineQueryResult {
  type: string;
  id: string;
}

export interface InlineQueryResultArticle extends InlineQueryResult {
  type: 'article';
  title: string;
  input_message_content: InputMessageContent;
  reply_markup?: InlineKeyboardMarkup;
  url?: string;
  hide_url?: boolean;
  description?: string;
  thumb_url?: string;
  thumb_width?: number;
  thumb_height?: number;
}

export interface InlineQueryResultPhoto extends InlineQueryResult {
  type: 'photo';
  photo_url: string;
  thumb_url: string;
  photo_width?: number;
  photo_height?: number;
  title?: string;
  description?: string;
  caption?: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  caption_entities?: MessageEntity[];
  reply_markup?: InlineKeyboardMarkup;
  input_message_content?: InputMessageContent;
}

export interface InlineQueryResultGif extends InlineQueryResult {
  type: 'gif';
  gif_url: string;
  gif_width?: number;
  gif_height?: number;
  gif_duration?: number;
  thumb_url: string;
  title?: string;
  caption?: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  caption_entities?: MessageEntity[];
  reply_markup?: InlineKeyboardMarkup;
  input_message_content?: InputMessageContent;
}

export interface InlineQueryResultMpeg4Gif extends InlineQueryResult {
  type: 'mpeg4_gif';
  mpeg4_url: string;
  mpeg4_width?: number;
  mpeg4_height?: number;
  mpeg4_duration?: number;
  thumb_url: string;
  title?: string;
  caption?: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  caption_entities?: MessageEntity[];
  reply_markup?: InlineKeyboardMarkup;
  input_message_content?: InputMessageContent;
}

export interface InlineQueryResultVideo extends InlineQueryResult {
  type: 'video';
  video_url: string;
  mime_type: 'text/html' | 'video/mp4';
  thumb_url: string;
  title: string;
  caption?: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  caption_entities?: MessageEntity[];
  video_width?: number;
  video_height?: number;
  video_duration?: number;
  description?: string;
  reply_markup?: InlineKeyboardMarkup;
  input_message_content?: InputMessageContent;
}

export interface InlineQueryResultAudio extends InlineQueryResult {
  type: 'audio';
  audio_url: string;
  title: string;
  caption?: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  caption_entities?: MessageEntity[];
  performer?: string;
  audio_duration?: number;
  reply_markup?: InlineKeyboardMarkup;
  input_message_content?: InputMessageContent;
}

export interface InlineQueryResultVoice extends InlineQueryResult {
  type: 'voice';
  voice_url: string;
  title: string;
  caption?: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  caption_entities?: MessageEntity[];
  voice_duration?: number;
  reply_markup?: InlineKeyboardMarkup;
  input_message_content?: InputMessageContent;
}

export interface InlineQueryResultDocument extends InlineQueryResult {
  type: 'document';
  title: string;
  caption?: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  caption_entities?: MessageEntity[];
  document_url: string;
  mime_type: 'application/pdf' | 'application/zip';
  description?: string;
  reply_markup?: InlineKeyboardMarkup;
  input_message_content?: InputMessageContent;
  thumb_url?: string;
  thumb_width?: number;
  thumb_height?: number;
}

export interface InlineQueryResultLocation extends InlineQueryResult {
  type: 'location';
  latitude: number;
  longitude: number;
  title: string;
  horizontal_accuracy?: number;
  live_period?: number;
  heading?: number;
  proximity_alert_radius?: number;
  reply_markup?: InlineKeyboardMarkup;
  input_message_content?: InputMessageContent;
  thumb_url?: string;
  thumb_width?: number;
  thumb_height?: number;
}

export interface InlineQueryResultVenue extends InlineQueryResult {
  type: 'venue';
  latitude: number;
  longitude: number;
  title: string;
  address: string;
  foursquare_id?: string;
  foursquare_type?: string;
  google_place_id?: string;
  google_place_type?: string;
  reply_markup?: InlineKeyboardMarkup;
  input_message_content?: InputMessageContent;
  thumb_url?: string;
  thumb_width?: number;
  thumb_height?: number;
}

export interface InlineQueryResultContact extends InlineQueryResult {
  type: 'contact';
  phone_number: string;
  first_name: string;
  last_name?: string;
  vcard?: string;
  reply_markup?: InlineKeyboardMarkup;
  input_message_content?: InputMessageContent;
  thumb_url?: string;
  thumb_width?: number;
  thumb_height?: number;
}

export interface InlineQueryResultGame extends InlineQueryResult {
  type: 'game';
  game_short_name: string;
  reply_markup?: InlineKeyboardMarkup;
}

export interface InlineQueryResultCachedPhoto extends InlineQueryResult {
  type: 'photo';
  photo_file_id: string;
  title?: string;
  description?: string;
  caption?: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  caption_entities?: MessageEntity[];
  reply_markup?: InlineKeyboardMarkup;
  input_message_content?: InputMessageContent;
}

export interface InlineQueryResultCachedGif extends InlineQueryResult {
  type: 'gif';
  gif_file_id: string;
  title?: string;
  caption?: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  caption_entities?: MessageEntity[];
  reply_markup?: InlineKeyboardMarkup;
  input_message_content?: InputMessageContent;
}

export interface InlineQueryResultCachedMpeg4Gif extends InlineQueryResult {
  type: 'mpeg4_gif';
  mpeg4_file_id: string;
  title?: string;
  caption?: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  caption_entities?: MessageEntity[];
  reply_markup?: InlineKeyboardMarkup;
  input_message_content?: InputMessageContent;
}

export interface InlineQueryResultCachedSticker extends InlineQueryResult {
  type: 'sticker';
  sticker_file_id: string;
  reply_markup?: InlineKeyboardMarkup;
  input_message_content?: InputMessageContent;
}

export interface InlineQueryResultCachedDocument extends InlineQueryResult {
  type: 'document';
  title: string;
  document_file_id: string;
  description?: string;
  caption?: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  caption_entities?: MessageEntity[];
  reply_markup?: InlineKeyboardMarkup;
  input_message_content?: InputMessageContent;
}

export interface InlineQueryResultCachedVideo extends InlineQueryResult {
  type: 'video';
  video_file_id: string;
  title: string;
  description?: string;
  caption?: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  caption_entities?: MessageEntity[];
  reply_markup?: InlineKeyboardMarkup;
  input_message_content?: InputMessageContent;
}

export interface InlineQueryResultCachedVoice extends InlineQueryResult {
  type: 'voice';
  voice_file_id: string;
  title: string;
  caption?: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  caption_entities?: MessageEntity[];
  reply_markup?: InlineKeyboardMarkup;
  input_message_content?: InputMessageContent;
}

export interface InlineQueryResultCachedAudio extends InlineQueryResult {
  type: 'audio';
  audio_file_id: string;
  caption?: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  caption_entities?: MessageEntity[];
  reply_markup?: InlineKeyboardMarkup;
  input_message_content?: InputMessageContent;
}

export interface InputMessageContent {
  message_text: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  entities?: MessageEntity[];
  disable_web_page_preview?: boolean;
}

export interface InputTextMessageContent extends InputMessageContent {
  message_text: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  entities?: MessageEntity[];
  disable_web_page_preview?: boolean;
}

export interface InputLocationMessageContent {
  latitude: number;
  longitude: number;
  horizontal_accuracy?: number;
  live_period?: number;
  heading?: number;
  proximity_alert_radius?: number;
}

export interface InputVenueMessageContent {
  latitude: number;
  longitude: number;
  title: string;
  address: string;
  foursquare_id?: string;
  foursquare_type?: string;
  google_place_id?: string;
  google_place_type?: string;
}

export interface InputContactMessageContent {
  phone_number: string;
  first_name: string;
  last_name?: string;
  vcard?: string;
}

export interface InputInvoiceMessageContent {
  title: string;
  description: string;
  payload: string;
  provider_token: string;
  currency: string;
  prices: LabeledPrice[];
  max_tip_amount?: number;
  suggested_tip_amounts?: number[];
  provider_data?: string;
  photo_url?: string;
  photo_size?: number;
  photo_width?: number;
  photo_height?: number;
  need_name?: boolean;
  need_phone_number?: boolean;
  need_email?: boolean;
  need_shipping_address?: boolean;
  send_phone_number_to_provider?: boolean;
  send_email_to_provider?: boolean;
  is_flexible?: boolean;
}

export interface ChosenInlineResult {
  result_id: string;
  from: User;
  location?: Location;
  inline_message_id?: string;
  query: string;
}

export interface SendInvoiceParams {
  chat_id: number | string;
  message_thread_id?: number;
  title: string;
  description: string;
  payload: string;
  provider_token: string;
  currency: string;
  prices: LabeledPrice[];
  max_tip_amount?: number;
  suggested_tip_amounts?: number[];
  start_parameter?: string;
  provider_data?: string;
  photo_url?: string;
  photo_size?: number;
  photo_width?: number;
  photo_height?: number;
  need_name?: boolean;
  need_phone_number?: boolean;
  need_email?: boolean;
  need_shipping_address?: boolean;
  send_phone_number_to_provider?: boolean;
  send_email_to_provider?: boolean;
  is_flexible?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: InlineKeyboardMarkup;
}

export interface SendInvoiceResponse extends Message {}

export interface CreateInvoiceLinkParams {
  title: string;
  description: string;
  payload: string;
  provider_token: string;
  currency: string;
  prices: LabeledPrice[];
  max_tip_amount?: number;
  suggested_tip_amounts?: number[];
  provider_data?: string;
  photo_url?: string;
  photo_size?: number;
  photo_width?: number;
  photo_height?: number;
  need_name?: boolean;
  need_phone_number?: boolean;
  need_email?: boolean;
  need_shipping_address?: boolean;
  send_phone_number_to_provider?: boolean;
  send_email_to_provider?: boolean;
  is_flexible?: boolean;
}

export type CreateInvoiceLinkResponse = string;

export interface AnswerShippingQueryParams {
  shipping_query_id: string;
  ok: boolean;
  shipping_options?: ShippingOption[];
  error_message?: string;
}

export type AnswerShippingQueryResponse = boolean;

export interface AnswerPreCheckoutQueryParams {
  pre_checkout_query_id: string;
  ok: boolean;
  error_message?: string;
}

export type AnswerPreCheckoutQueryResponse = boolean;

export interface SetPassportDataErrorsParams {
  user_id: number;
  errors: PassportElementError[];
}

export type SetPassportDataErrorsResponse = boolean;

export interface PassportElementError {
  source: string;
  type: string;
  message: string;
}

export interface PassportElementErrorDataField extends PassportElementError {
  source: 'data';
  type: 'personal_details' | 'passport' | 'driver_license' | 'identity_card' | 'internal_passport' | 'address';
  field_name: string;
  data_hash: string;
}

export interface PassportElementErrorFrontSide extends PassportElementError {
  source: 'front_side';
  type: 'passport' | 'driver_license' | 'identity_card' | 'internal_passport';
  file_hash: string;
}

export interface PassportElementErrorReverseSide extends PassportElementError {
  source: 'reverse_side';
  type: 'driver_license' | 'identity_card';
  file_hash: string;
}

export interface PassportElementErrorSelfie extends PassportElementError {
  source: 'selfie';
  type: 'passport' | 'driver_license' | 'identity_card' | 'internal_passport';
  file_hash: string;
}

export interface PassportElementErrorFile extends PassportElementError {
  source: 'file';
  type: 'utility_bill' | 'bank_statement' | 'rental_agreement' | 'passport_registration' | 'temporary_registration';
  file_hash: string;
}

export interface PassportElementErrorFiles extends PassportElementError {
  source: 'files';
  type: 'utility_bill' | 'bank_statement' | 'rental_agreement' | 'passport_registration' | 'temporary_registration';
  file_hashes: string[];
}

export interface PassportElementErrorTranslationFile extends PassportElementError {
  source: 'translation_file';
  type: 'passport' | 'driver_license' | 'identity_card' | 'internal_passport' | 'utility_bill' | 'bank_statement' | 'rental_agreement' | 'passport_registration' | 'temporary_registration';
  file_hash: string;
}

export interface PassportElementErrorTranslationFiles extends PassportElementError {
  source: 'translation_files';
  type: 'passport' | 'driver_license' | 'identity_card' | 'internal_passport' | 'utility_bill' | 'bank_statement' | 'rental_agreement' | 'passport_registration' | 'temporary_registration';
  file_hashes: string[];
}

export interface PassportElementErrorUnspecified extends PassportElementError {
  source: 'unspecified';
  type: 'data' | 'front_side' | 'reverse_side' | 'selfie' | 'file' | 'files' | 'translation_file' | 'translation_files';
  element_hash: string;
}

export interface SendGameParams {
  chat_id: number;
  message_thread_id?: number;
  game_short_name: string;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: InlineKeyboardMarkup;
}

export interface SendGameResponse extends Message {}

export interface SetGameScoreParams {
  user_id: number;
  score: number;
  force?: boolean;
  disable_edit_message?: boolean;
  chat_id?: number;
  message_id?: number;
  inline_message_id?: string;
}

export type SetGameScoreResponse = Message | boolean;

export interface GetGameHighScoresParams {
  user_id: number;
  chat_id?: number;
  message_id?: number;
  inline_message_id?: string;
}

export interface GetGameHighScoresResponse extends Array<GameHighScore> {}

export interface GetUpdatesParams {
  offset?: number;
  limit?: number;
  timeout?: number;
  allowed_updates?: string[];
}

export interface GetUpdatesResponse extends Array<Update> {}

export interface SetWebhookParams {
  url: string;
  certificate?: string;
  ip_address?: string;
  max_connections?: number;
  allowed_updates?: string[];
  drop_pending_updates?: boolean;
  secret_token?: string;
}

export type SetWebhookResponse = boolean;

export interface DeleteWebhookParams {
  drop_pending_updates?: boolean;
}

export type DeleteWebhookResponse = boolean;

export interface GetWebhookInfoResponse extends WebhookInfo {}

export interface InlineQueryResultsButton {
  text: string;
  web_app?: WebAppInfo;
  start_parameter?: string;
}