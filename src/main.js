const sharp = require("sharp");
const ques = require("readline-sync")
const fs = require("fs");
const { exit } = require("process");


ASCII_CHARS = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ".split(
    ""
);
charLength = ASCII_CHARS.length;
interval = charLength / 256;



async function main() {
    const filePath = getPath()
    const ratio = (process.stdout.columns / process.stdout.rows) / 2
    const size = [parseInt(process.stdout.rows * ratio), parseInt(process.stdout.rows * ratio)]

    try {
        let gImage = sharp(filePath).greyscale()
        console.log(size);
        let newImg = gImage.resize(size[0], size[1], {
            fit: "inside",
        })
        let pp = await toPixels(newImg, size)
        console.log(pp);
    } catch (error) {
        console.log(error);
        main()
    }
    exit(0)
}

async function toPixels(img, size) {
    let imagePixels = await img.raw().toBuffer();
    let characters = "";

    let newWidth = size[0]
    imagePixels.forEach((pixel) => {
        characters = characters + ASCII_CHARS[Math.floor(pixel * interval)];
    });

    let ASCII = ""
    for (i = 0; i < characters.length; i += newWidth) {
        let line = characters.split("").slice(i, i + newWidth);
        ASCII = ASCII + "\n" + line;
    }
    return ASCII
}

function getPath() {
    let filePath = ques.questionPath("path to image: ")

    if (fs.existsSync(filePath)) {
        return filePath
    }
    console.log('file on apth not exist');
    exit(0)
}
main()