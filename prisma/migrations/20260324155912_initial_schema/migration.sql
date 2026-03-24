-- CreateTable
CREATE TABLE `Parent` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Parent_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Child` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `avatar` VARCHAR(191) NOT NULL DEFAULT 'fox',
    `ageGroup` ENUM('EXPLORER', 'ADVENTURER', 'CHALLENGER') NOT NULL,
    `xp` INTEGER NOT NULL DEFAULT 0,
    `level` INTEGER NOT NULL DEFAULT 1,
    `streak` INTEGER NOT NULL DEFAULT 0,
    `lastPlayedAt` DATETIME(3) NULL,
    `parentId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Child_parentId_idx`(`parentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sticker` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `rarity` ENUM('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY') NOT NULL,
    `source` ENUM('GIPHY', 'GEMINI') NOT NULL,
    `album` VARCHAR(191) NOT NULL,
    `prompt` TEXT NULL,
    `themeId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Sticker_rarity_idx`(`rarity`),
    INDEX `Sticker_themeId_idx`(`themeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChildSticker` (
    `id` VARCHAR(191) NOT NULL,
    `childId` VARCHAR(191) NOT NULL,
    `stickerId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `earnedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ChildSticker_childId_idx`(`childId`),
    INDEX `ChildSticker_stickerId_idx`(`stickerId`),
    UNIQUE INDEX `ChildSticker_childId_stickerId_key`(`childId`, `stickerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameSession` (
    `id` VARCHAR(191) NOT NULL,
    `childId` VARCHAR(191) NOT NULL,
    `gameType` VARCHAR(191) NOT NULL,
    `pillar` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL,
    `xpEarned` INTEGER NOT NULL,
    `accuracy` DOUBLE NOT NULL,
    `duration` INTEGER NOT NULL,
    `playedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GameSession_childId_idx`(`childId`),
    INDEX `GameSession_gameType_idx`(`gameType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AudioCache` (
    `id` VARCHAR(191) NOT NULL,
    `text` VARCHAR(500) NOT NULL,
    `audioUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AudioCache_text_key`(`text`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaCache` (
    `id` VARCHAR(191) NOT NULL,
    `query` VARCHAR(200) NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `videoUrl` VARCHAR(191) NULL,
    `source` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `MediaCache_query_key`(`query`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Theme` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `ageGroup` ENUM('EXPLORER', 'ADVENTURER', 'CHALLENGER') NOT NULL,
    `bgPrompt` TEXT NOT NULL,
    `charPrompt` TEXT NOT NULL,
    `stickerPrompt` TEXT NOT NULL,
    `bgImageUrl` VARCHAR(191) NULL,
    `charImageUrl` VARCHAR(191) NULL,
    `activeFrom` DATETIME(3) NOT NULL,
    `activeTo` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Theme_ageGroup_idx`(`ageGroup`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
