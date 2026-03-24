const fs = require("fs")
const https = require("https")
const path = require("path")

const dir = path.join(__dirname, "..", "public", "sounds", "letters")
fs.mkdirSync(dir, { recursive: true })

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

console.log("Baixando MP3s de todas as letras usando a pronúncia nativa do alfabeto...")

// Phonetic mapping to ensure Google TTS pronounces alphabet names perfectly in Portuguese
const PHONETIC_FIXES = {
    'A': 'Á',
    'E': 'É',
    'I': 'Í',
    'O': 'Ó',
    'U': 'Ú',
    // Extra clarity for letters that can be confused
    'K': 'Cá',
    'Y': 'Ípsilon',
    'W': 'Dáblio'
}

Promise.all(LETTERS.map(letter => {
    return new Promise((resolve, reject) => {
        const spokenLetter = PHONETIC_FIXES[letter] || letter
        const text = encodeURIComponent(`Letra ${spokenLetter}`)
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${text}&tl=pt-BR&client=tw-ob`

        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to download ${letter}`))
                return
            }
            const file = fs.createWriteStream(path.join(dir, `${letter}.mp3`))
            res.pipe(file)
            file.on("finish", () => {
                file.close()
                console.log(`✅ ${letter}.mp3 baixado (Texto: Letra ${spokenLetter})`)
                resolve()
            })
        }).on("error", reject)
    })
})).then(() => {
    console.log("🎉 Todos os 26 áudios baixados com sucesso para public/sounds/letters/")
}).catch(console.error)
