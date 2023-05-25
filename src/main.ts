import { exit, stdout } from "process";
import fs, { PathLike } from "fs";
import sharp from "sharp";
import ques from "readline-sync";

type size = [number, number]

class ASCII_Generator {

    private readonly ASCII_CHARS: string[] = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ".split(
        ""
    );
    private readonly charLength: number = this.ASCII_CHARS.length;
    private readonly interval: number = this.charLength / 256;
    readonly filePath: string;

    toFile = false;
    toConsole = true;
    withColor = false;
    inFullScreen = false

    constructor(filePath: string, args?: string[]) {

        if (args) {
            this.chechParams(args)
        }

        this.filePath = filePath
        let sourceImg: sharp.Sharp = sharp(this.filePath)

        this.toFile ? this.printToFile(sourceImg) : this.printToConsole(sourceImg)
    }

    convertGreyImage(img: sharp.Sharp): sharp.Sharp {

        let newImg = img.greyscale()

        return newImg
    }

    convertColorImage(img: sharp.Sharp): sharp.Sharp {
        throw new Error("Function not implemented.");
    }

    resizeImage( img: sharp.Sharp): sharp.Sharp{
        const ratio: number = (process.stdout.columns / process.stdout.rows) / 2
        const size: size = [Math.floor(stdout.rows * ratio), Math.floor(stdout.rows * ratio)]

        return img.resize(size[0], size[1], {
            fit: "inside",
        })
    }

    printToFile(img: sharp.Sharp ): void {

        this.inFullScreen ? null : img = this.resizeImage(img)
        this.withColor ? img = this.convertColorImage(img) : img = this.convertGreyImage(img)

        this.createArt(img)
        .then(ar=>{
            fs.writeFileSync("Art.txt", ar)
        })
    }

    printToConsole(img: sharp.Sharp): void {
        this.inFullScreen ? null : img = this.resizeImage(img)
        this.withColor ? img = this.convertColorImage(img) : img = this.convertGreyImage(img)

        this.createArt(img)
        .then(ar=>{
            console.log(ar);
        })
    }

    async createArt(img: sharp.Sharp): Promise<string>{
        let imagePixels: Buffer = await img.raw().toBuffer();
        let characters = "";
        let width = (await img.metadata()).width || 100

        imagePixels.forEach((pixel: any) => {
            characters = characters + this.ASCII_CHARS[Math.floor(pixel * this.interval)];
        });

        let ASCII = ""
        for (let i = 0; i < characters.length; i += width) {
            let line = characters.split("").slice(i, i + width);
            ASCII = ASCII + "\n" + line;
        }

        return ASCII
    } 

    chechParams(args: string[]): void {
        for (let i of args) {
            if (i === "-c" || i === "--color") {
                this.withColor = true
            }
            if (i === "-f" || i === "--toFile") {
                this.toFile = true;
                this.toConsole = false
            }
            if (i === "-t" || i === "--console") {
                this.toConsole = true
            }
            if (i === "-w" || i === "--windowed") {
                this.inFullScreen = false
            }
        }
    }
}
main()
function main(): void {
    let [filePath, ...param] = ques.promptCL()

    if (fs.existsSync(filePath)) {
        new ASCII_Generator(filePath, param)
    }
    else {
        console.log('file on apth not exist');
        exit(0)
    }
}


