// ═══════════════════════════════════════════════════════════════
// ═══ Commands Module — لمّة Chat v12
// ═══════════════════════════════════════════════════════════════

import * as utils from './utils.js';

class CommandParser {
  constructor(db, moderation, auth) {
    this.db = db;
    this.moderation = moderation;
    this.auth = auth;
    this.commands = this.initializeCommands();
  }

  /**
   * Initialize command handlers
   */
  initializeCommands() {
    return {
      // Admin commands
      ban: {
        description: 'حظر مستخدم',
        usage: '/ban [اسم] [السبب]',
        handler: this.handleBan.bind(this),
        admin: true,
      },
      unban: {
        description: 'فك حظر مستخدم',
        usage: '/unban [اسم]',
        handler: this.handleUnban.bind(this),
        admin: true,
      },
      mute: {
        description: 'كتم مستخدم مؤقتاً',
        usage: '/mute [اسم] [الدقائق]',
        handler: this.handleMute.bind(this),
        admin: true,
      },
      unmute: {
        description: 'فك كتم مستخدم',
        usage: '/unmute [اسم]',
        handler: this.handleUnmute.bind(this),
        admin: true,
      },
      kick: {
        description: 'طرد مستخدم من الغرفة',
        usage: '/kick [اسم]',
        handler: this.handleKick.bind(this),
        admin: true,
      },
      warn: {
        description: 'تنبيه مستخدم',
        usage: '/warn [اسم] [السبب]',
        handler: this.handleWarn.bind(this),
        admin: true,
      },
      admin: {
        description: 'ترقية مستخدم لمدير',
        usage: '/admin [اسم]',
        handler: this.handleAdmin.bind(this),
        admin: true,
      },
      mod: {
        description: 'ترقية مستخدم لمشرف',
        usage: '/mod [اسم]',
        handler: this.handleMod.bind(this),
        admin: true,
      },
      vip: {
        description: 'منح صلاحيات VIP',
        usage: '/vip [اسم]',
        handler: this.handleVIP.bind(this),
        admin: true,
      },

      // User commands
      help: {
        description: 'عرض قائمة المساعدة',
        usage: '/help',
        handler: this.handleHelp.bind(this),
        admin: false,
      },
      commands: {
        description: 'عرض قائمة الأوامر',
        usage: '/commands',
        handler: this.handleCommands.bind(this),
        admin: false,
      },
      me: {
        description: 'رسالة بصيغة المائل',
        usage: '/me [النص]',
        handler: this.handleMe.bind(this),
        admin: false,
      },
      nick: {
        description: 'تغيير الاسم المستعار',
        usage: '/nick [الاسم الجديد]',
        handler: this.handleNick.bind(this),
        admin: false,
      },
      color: {
        description: 'تغيير لون الرسائل',
        usage: '/color [الكود]',
        handler: this.handleColor.bind(this),
        admin: false,
      },
      ignore: {
        description: 'تجاهل مستخدم',
        usage: '/ignore [اسم]',
        handler: this.handleIgnore.bind(this),
        admin: false,
      },
      away: {
        description: 'تعيين الحالة بعيد',
        usage: '/away [الرسالة]',
        handler: this.handleAway.bind(this),
        admin: false,
      },
      back: {
        description: 'تعيين الحالة متصل',
        usage: '/back',
        handler: this.handleBack.bind(this),
        admin: false,
      },
    };
  }

  /**
   * Parse and execute command
   */
  async execute(text, userId) {
    const parsed = utils.parseCommand(text);
    if (!parsed) return { success: false, message: 'أمر غير صحيح' };

    const { command, args } = parsed;
    const cmd = this.commands[command];

    if (!cmd) {
      return { success: false, message: `❌ الأمر غير معروف: /${command}` };
    }

    try {
      return await cmd.handler(args, userId);
    } catch (error) {
      console.error(`❌ خطأ في تنفيذ الأمر /${command}:`, error);
      return { success: false, message: `❌ حدث خطأ: ${error.message}` };
    }
  }

  // Admin command handlers
  async handleBan(args, userId) {
    if (args.length < 1) return { success: false, message: '❌ الاستخدام: /ban [اسم] [السبب]' };
    const result = await this.db.banUser(args[0], args[0], args.slice(1).join(' '));
    return result
      ? { success: true, message: `✅ تم حظر ${args[0]}` }
      : { success: false, message: '❌ فشل حظر المستخدم' };
  }

  async handleUnban(args, userId) {
    if (args.length < 1) return { success: false, message: '❌ الاستخدام: /unban [اسم]' };
    const result = await this.db.unbanUser(args[0]);
    return result
      ? { success: true, message: `✅ تم فك حظر ${args[0]}` }
      : { success: false, message: '❌ فشل فك الحظر' };
  }

  async handleMute(args, userId) {
    if (args.length < 1) return { success: false, message: '❌ الاستخدام: /mute [اسم] [الدقائق]' };
    const duration = (parseInt(args[1]) || 5) * 60000;
    this.moderation.muteUser(args[0], duration);
    return { success: true, message: `✅ تم كتم ${args[0]} لمدة ${parseInt(args[1]) || 5} دقائق` };
  }

  async handleUnmute(args, userId) {
    if (args.length < 1) return { success: false, message: '❌ الاستخدام: /unmute [اسم]' };
    this.moderation.unmuteUser(args[0]);
    return { success: true, message: `✅ تم فك كتم ${args[0]}` };
  }

  async handleKick(args, userId) {
    if (args.length < 1) return { success: false, message: '❌ الاستخدام: /kick [اسم]' };
    return { success: true, message: `✅ تم طرد ${args[0]} من الغرفة` };
  }

  async handleWarn(args, userId) {
    if (args.length < 1) return { success: false, message: '❌ الاستخدام: /warn [اسم] [السبب]' };
    const result = await this.moderation.addWarning(args[0], args.slice(1).join(' '));
    return { success: true, message: result.message };
  }

  async handleAdmin(args, userId) {
    if (args.length < 1) return { success: false, message: '❌ الاستخدام: /admin [اسم]' };
    return { success: true, message: `✅ تم ترقية ${args[0]} لمدير` };
  }

  async handleMod(args, userId) {
    if (args.length < 1) return { success: false, message: '❌ الاستخدام: /mod [اسم]' };
    return { success: true, message: `✅ تم ترقية ${args[0]} لمشرف` };
  }

  async handleVIP(args, userId) {
    if (args.length < 1) return { success: false, message: '❌ الاستخدام: /vip [اسم]' };
    return { success: true, message: `✅ تم منح ${args[0]} صلاحيات VIP` };
  }

  // User command handlers
  async handleHelp(args, userId) {
    const userCommands = Object.entries(this.commands)
      .filter(([_, cmd]) => !cmd.admin)
      .map(([name, cmd]) => `  /${name}: ${cmd.description}`)
      .join('\n');

    return {
      success: true,
      message: `📖 أوامر المستخدم:\n${userCommands}`,
    };
  }

  async handleCommands(args, userId) {
    const allCommands = Object.keys(this.commands).join(', ');
    return {
      success: true,
      message: `📋 الأوامر المتاحة:\n${allCommands}`,
    };
  }

  async handleMe(args, userId) {
    if (args.length < 1) return { success: false, message: '❌ الاستخدام: /me [النص]' };
    return {
      success: true,
      message: `*${this.auth.getNickname()}: ${args.join(' ')}*`,
      isAction: true,
    };
  }

  async handleNick(args, userId) {
    if (args.length < 1) return { success: false, message: '❌ الاستخدام: /nick [الاسم]' };
    const newNick = args[0];
    if (!utils.validateNickname(newNick)) {
      return { success: false, message: '❌ الاسم يجب أن يكون 2-30 حرف' };
    }
    return { success: true, message: `✅ تم تغيير اسمك إلى ${newNick}` };
  }

  async handleColor(args, userId) {
    if (args.length < 1) return { success: false, message: '❌ الاستخدام: /color [الكود]' };
    const color = args[0];
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      return { success: false, message: '❌ كود لون غير صحيح' };
    }
    return { success: true, message: `✅ تم تغيير لونك إلى ${color}` };
  }

  async handleIgnore(args, userId) {
    if (args.length < 1) return { success: false, message: '❌ الاستخدام: /ignore [اسم]' };
    return { success: true, message: `✅ تم تجاهل ${args[0]}` };
  }

  async handleAway(args, userId) {
    const message = args.length > 0 ? args.join(' ') : 'بعيد الآن';
    return { success: true, message: `✅ تم تعيين حالتك: ${message}`, status: 'away' };
  }

  async handleBack(args, userId) {
    return { success: true, message: '✅ أنت الآن متصل', status: 'online' };
  }

  /**
   * Get all commands
   */
  getCommands() {
    return this.commands;
  }

  /**
   * Get command description
   */
  getCommandDescription(command) {
    const cmd = this.commands[command];
    return cmd ? cmd.description : null;
  }
}

export default CommandParser;
