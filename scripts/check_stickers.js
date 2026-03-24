const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
    const stickers = await prisma.sticker.findMany({
        take: 10
    })
    console.log(JSON.stringify(stickers, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
