require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const ALLOWED_ROLES = ["Queen", "Co-Leader", "Leader"];

async function getWebhook(channel) {
  const webhooks = await channel.fetchWebhooks();

  let hook = webhooks.find((w) => w.name === "VOTC Bot");

  if (!hook) {
    hook = await channel.createWebhook({
      name: "VOTC Bot",
    });
  }

  return hook;
}

client.once("ready", () => {
  console.log(`✅ Bot läuft als ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;
    if (!message.guild) return;

    const prefix = process.env.PREFIX || "!say";
    if (!message.content.startsWith(prefix)) return;

    const memberRoles = message.member.roles.cache.map((role) => role.name);
    const hasAllowedRole = ALLOWED_ROLES.some((role) =>
      memberRoles.includes(role)
    );

    if (!hasAllowedRole) {
      await message.reply("Du darfst diesen Befehl nicht benutzen.");
      return;
    }

    const text = message.content.slice(prefix.length).trim();
    if (!text) return;

    const botMember = message.guild.members.me;

    if (
      message.channel
        .permissionsFor(botMember)
        ?.has(PermissionsBitField.Flags.ManageMessages)
    ) {
      await message.delete().catch(() => {});
    }

    const webhook = await getWebhook(message.channel);

    await webhook.send({
      content: text,
      username: process.env.BOT_NAME,
      avatarURL: process.env.AVATAR_URL,
    });
  } catch (error) {
    console.error("Fehler:", error);
  }
});

client.login(process.env.BOT_TOKEN);