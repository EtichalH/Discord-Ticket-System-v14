export default {
  colors: {
    primary: 0x5865F2,    // blurple
    success: 0x57F287,
    warning: 0xFEE75C,
    danger:  0xED4245,
    neutral: 0x2B2D31
  },

  // FILL THESE
  roles: {
    staffRoleId: "1404958070911537154"   // staff who can manage tickets
  },

  categories: {
    openCategoryId: "1405244534497214665",   // category where new tickets go
    closedCategoryId: "1405244607549407335"  // archived/closed tickets
  },

  channels: {
    logChannelId: "1405271450641891338" // where logs + transcripts are posted
  },

  limits: {
    userOpenTicketLimit: 1,         // max open tickets per user
    createCooldownMs: 2 * 60_000    // anti-spam for opening tickets
  },

  ticket: {
    namePrefix: "ticket",
    staffCanSeeAll: true,           // if false, only opener & staff role see it
    mentionStaffOnOpen: true,
    claimAddsOnlyClaimer: false     // if true, hide other staff when claimed
  }
};
