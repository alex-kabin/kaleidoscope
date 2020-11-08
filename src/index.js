import { initBarrel } from './barrel';

const a = 110; // w size
const k = 2; // gap correction
const D = Math.floor(6+Math.random()*3); // density

const SIN60 = Math.sin(Math.PI/3);
const COS60 = Math.cos(Math.PI/3);
const aw = a;
const haw = Math.floor(aw / 2);
const ah = Math.floor(a * SIN60);

const barrel = initBarrel(a);

window.onload = function() {
    const $main = document.getElementsByTagName("main")[0];
    const width = $main.clientWidth;
    const height = $main.clientHeight;

    console.log("main.width=", width, "main.height=", height);

    const canvas = createCanvas(width, height);
    $main.appendChild(canvas);
    const patternCanvas = createCanvas(aw, ah);
    const patternCtx = patternCanvas.getContext("2d");
    const ctx = canvas.getContext("2d");

    function drawCell(x, y) {
        ctx.translate(x, y);
        for (let i = 0; i < 6; i++) {
            ctx.rotate(Math.PI * 2 / 6);
            ctx.save();
            const d = i % 2 ? 1 : -1;
            ctx.scale(d, 1);
            ctx.drawImage(patternCanvas, -haw, 0);
            ctx.restore();
        }
    }

    const m = Math.floor(Math.sqrt(Math.pow(width+2*aw,2) + Math.pow(height+2*ah, 2)));

    function refresh(a) {
        //ctx.fillStyle = "rgba(20,20,20,0.7)";
        //ctx.fillRect(0, 0, width, height);
        ctx.clearRect(0, 0, width, height);
        ctx.translate(width/2, height/2);
        ctx.rotate(a);
        for (let x = 0, i = 0; x < m; x += aw + haw - k, i = (i + 1) % 2) {
            for (let y = i ? ah : 0; y < m; y += ah + ah - k) {
                ctx.save();
                drawCell(x-Math.floor(m/2), y-Math.floor(m/2));
                ctx.restore();
            }
        }
    }

    let rot = 0;

    document.body.addEventListener("keydown", onKeyDown);

    function onKeyDown(event) {
        if (event.key === "ArrowLeft") {
            rot += 2*Math.PI / 180;
        }
        else if(event.key === "ArrowRight") {
            rot -= 2*Math.PI/180;
        }
        else {
            return;
        }

        if(rot > Math.PI) {
            rot = -2*Math.PI+rot;
        }

        barrel.rotate(rot);
    }

    barrel.start();

    (function loop() {
        paint();
        window.requestAnimationFrame(loop);
    })();

    function paint() {
        ctx.save();
        //preparePattern(patternCanvas, k);
        //refresh(0);
        //ctx.clearRect(0, 0, width, height);
        //barrel.render(ctx);
        preparePattern(patternCtx, k);
        refresh(rot);
        //drawCell(200, 200);
        ctx.restore();
    }
};



function createCanvas(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

function preparePattern(ctx, k) {
    const width = Number(ctx.canvas.width);
    const height = Number(ctx.canvas.height);
    const dx = Math.floor(k * SIN60);
    const dy = Math.floor(k * COS60);

    ctx.save();

    ctx.beginPath();
    ctx.moveTo(-dx, height + dy);
    ctx.lineTo(Math.floor(width / 2), -k);
    ctx.lineTo(width + dx, height + dy);
    ctx.closePath();
    ctx.clip();

    ctx.fillStyle = "#333333";
    ctx.fillRect(0, 0, width, height);

    ctx.translate(-Math.floor(width/2), -Math.floor(height/2)-D);
    barrel.render(ctx);
    ctx.restore();
}

function drawPattern(ctx, width, height) {
    // for(let i=0; i<10; i++) {
    //     const x = Math.random()*width;
    //     const y = Math.random()*height;
    //     const r = Math.random()*width*0.3;
    //     const color = `rgb(${Math.random()*256} ${Math.random()*256} ${Math.random()*256})`;
    //     ctx.beginPath();
    //     ctx.arc(x, y, r, 0, Math.PI * 2, true);
    //
    //     ctx.fillStyle = color;
    //     ctx.fill();
    // }
}
