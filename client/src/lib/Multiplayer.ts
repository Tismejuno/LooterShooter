import { Position } from "./gameTypes";

export interface PlayerData {
  id: string;
  username: string;
  position: Position;
  health: number;
  maxHealth: number;
  level: number;
  lastUpdate: number;
}

export interface PartyMember {
  id: string;
  username: string;
  level: number;
  isLeader: boolean;
}

export interface Party {
  id: string;
  name: string;
  members: PartyMember[];
  maxMembers: number;
  dungeonId?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
  channel: 'party' | 'global' | 'whisper';
}

/**
 * Multiplayer manager for real-time synchronization
 * Note: Requires Supabase or WebSocket backend to be fully functional
 */
export class MultiplayerManager {
  private playerId: string;
  private playerData: PlayerData | null = null;
  private otherPlayers: Map<string, PlayerData> = new Map();
  private currentParty: Party | null = null;
  private chatMessages: ChatMessage[] = [];
  private updateCallbacks: Set<(players: Map<string, PlayerData>) => void> = new Set();
  private chatCallbacks: Set<(message: ChatMessage) => void> = new Set();
  private wsConnection: WebSocket | null = null;
  
  constructor(playerId: string) {
    this.playerId = playerId;
  }
  
  /**
   * Initialize connection to multiplayer server
   */
  async connect(serverUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.wsConnection = new WebSocket(serverUrl);
        
        this.wsConnection.onopen = () => {
          console.log('Connected to multiplayer server');
          this.sendMessage({
            type: 'join',
            playerId: this.playerId
          });
          resolve();
        };
        
        this.wsConnection.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };
        
        this.wsConnection.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
        
        this.wsConnection.onclose = () => {
          console.log('Disconnected from multiplayer server');
        };
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Disconnect from multiplayer server
   */
  disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.otherPlayers.clear();
  }
  
  /**
   * Update local player data and sync to server
   */
  updatePlayerData(data: Partial<PlayerData>): void {
    this.playerData = {
      ...this.playerData,
      id: this.playerId,
      lastUpdate: Date.now(),
      ...data
    } as PlayerData;
    
    this.sendMessage({
      type: 'player_update',
      data: this.playerData
    });
  }
  
  /**
   * Get all other players in the session
   */
  getOtherPlayers(): Map<string, PlayerData> {
    return new Map(this.otherPlayers);
  }
  
  /**
   * Create a new party
   */
  async createParty(name: string, maxMembers: number = 4): Promise<Party> {
    const party: Party = {
      id: `party_${Date.now()}`,
      name,
      members: [{
        id: this.playerId,
        username: this.playerData?.username || 'Player',
        level: this.playerData?.level || 1,
        isLeader: true
      }],
      maxMembers
    };
    
    this.currentParty = party;
    
    this.sendMessage({
      type: 'party_create',
      data: party
    });
    
    return party;
  }
  
  /**
   * Join an existing party
   */
  async joinParty(partyId: string): Promise<void> {
    this.sendMessage({
      type: 'party_join',
      partyId,
      playerId: this.playerId,
      playerData: {
        username: this.playerData?.username || 'Player',
        level: this.playerData?.level || 1
      }
    });
  }
  
  /**
   * Leave current party
   */
  leaveParty(): void {
    if (this.currentParty) {
      this.sendMessage({
        type: 'party_leave',
        partyId: this.currentParty.id,
        playerId: this.playerId
      });
      
      this.currentParty = null;
    }
  }
  
  /**
   * Send a chat message
   */
  sendChat(message: string, channel: ChatMessage['channel'] = 'party'): void {
    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId: this.playerId,
      username: this.playerData?.username || 'Player',
      message,
      timestamp: Date.now(),
      channel
    };
    
    this.chatMessages.push(chatMessage);
    
    this.sendMessage({
      type: 'chat',
      data: chatMessage
    });
    
    this.notifyChatCallbacks(chatMessage);
  }
  
  /**
   * Get recent chat messages
   */
  getChatMessages(limit: number = 50): ChatMessage[] {
    return this.chatMessages.slice(-limit);
  }
  
  /**
   * Subscribe to player updates
   */
  onPlayerUpdate(callback: (players: Map<string, PlayerData>) => void): () => void {
    this.updateCallbacks.add(callback);
    return () => this.updateCallbacks.delete(callback);
  }
  
  /**
   * Subscribe to chat messages
   */
  onChatMessage(callback: (message: ChatMessage) => void): () => void {
    this.chatCallbacks.add(callback);
    return () => this.chatCallbacks.delete(callback);
  }
  
  /**
   * Get current party
   */
  getCurrentParty(): Party | null {
    return this.currentParty;
  }
  
  /**
   * Start a shared dungeon run with party
   */
  async startSharedDungeon(dungeonLevel: number): Promise<void> {
    if (!this.currentParty) {
      throw new Error('Must be in a party to start shared dungeon');
    }
    
    this.sendMessage({
      type: 'dungeon_start',
      partyId: this.currentParty.id,
      dungeonLevel
    });
  }
  
  private sendMessage(message: any): void {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify(message));
    }
  }
  
  private handleMessage(message: any): void {
    switch (message.type) {
      case 'player_update':
        if (message.data.id !== this.playerId) {
          this.otherPlayers.set(message.data.id, message.data);
          this.notifyUpdateCallbacks();
        }
        break;
        
      case 'player_disconnect':
        this.otherPlayers.delete(message.playerId);
        this.notifyUpdateCallbacks();
        break;
        
      case 'party_update':
        this.currentParty = message.data;
        break;
        
      case 'chat':
        this.chatMessages.push(message.data);
        this.notifyChatCallbacks(message.data);
        break;
        
      case 'dungeon_sync':
        // Handle dungeon state synchronization
        console.log('Dungeon sync:', message.data);
        break;
    }
  }
  
  private notifyUpdateCallbacks(): void {
    this.updateCallbacks.forEach(callback => {
      callback(this.otherPlayers);
    });
  }
  
  private notifyChatCallbacks(message: ChatMessage): void {
    this.chatCallbacks.forEach(callback => {
      callback(message);
    });
  }
}

/**
 * Supabase integration for persistent multiplayer data
 * Note: Requires @supabase/supabase-js package
 */
export class SupabaseMultiplayer {
  private supabaseUrl: string;
  private supabaseKey: string;
  // private supabase: any; // Would be SupabaseClient type
  
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;
    // this.supabase = createClient(supabaseUrl, supabaseKey);
  }
  
  /**
   * Save player progress to Supabase
   */
  async savePlayerProgress(playerId: string, data: any): Promise<void> {
    // Implementation would use Supabase client
    console.log('Saving player progress:', playerId, data);
    // await this.supabase.from('player_progress').upsert({ player_id: playerId, ...data });
  }
  
  /**
   * Load player progress from Supabase
   */
  async loadPlayerProgress(playerId: string): Promise<any> {
    // Implementation would use Supabase client
    console.log('Loading player progress:', playerId);
    // const { data } = await this.supabase.from('player_progress').select('*').eq('player_id', playerId).single();
    // return data;
    return null;
  }
  
  /**
   * Subscribe to real-time updates
   */
  subscribeToChannel(channel: string, callback: (payload: any) => void): () => void {
    // Implementation would use Supabase realtime
    console.log('Subscribing to channel:', channel);
    // const subscription = this.supabase.channel(channel).on('*', callback).subscribe();
    // return () => subscription.unsubscribe();
    return () => {};
  }
}
