const { abs } = Math;

function createAnalyser(ctx: AudioContext): AnalyserNode {
  const analyser: AnalyserNode = ctx.createAnalyser();
  analyser.fftSize = 2048;
  return analyser;
}

function gradArray(arr: number[]): number[] {
  const array: number[] = [];

  arr = arr.sort((a, b) => b - a);

  for (let i = 0; i < arr.length; i++) {
    if (i % 2 === 0) {
      array.push(arr[i]);
    } else {
      array.unshift(arr[i]);
    }
  }

  return array;
}

function init(): void {
  const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
  const audioEl: HTMLAudioElement = document.getElementById('audio') as HTMLAudioElement;
  const audioCtx: AudioContext = new AudioContext();
  const analyser: AnalyserNode = createAnalyser(audioCtx);
  const source: MediaElementAudioSourceNode = audioCtx.createMediaElementSource(audioEl);
  source.connect(analyser);
  source.connect(audioCtx.destination);
  const sourceData: Uint8Array = new Uint8Array(analyser.frequencyBinCount);
  console.log(sourceData);

  function render(data: Uint8Array|number[], now: number): void {
    data = gradArray([...data]) as number[];
    const { width, height } = canvas;

    function renderBackground(): void {
      ctx.save();
      ctx.fillStyle = '#101019';
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.fillRect(0, 0, width, height);
      ctx.closePath();
      ctx.restore();
    }

    function renderBars(): void {
      const space: number = width / data.length;
      data.forEach((value: number, i: number)=>{    
        ctx.save();
        const base: number = abs(now / 20) + abs(height - value);
        const r: number = base > 55 ? base % 55 : base;
        const g: number = base > 255 ? base % 255 : base;
        const b: number = base > 225 ? base % 225 : base;   
        ctx.strokeStyle = `rgb(${r},${g < 150 ? 150 : g},${b < 225 ? 225 : b})`;
        ctx.lineWidth =  1;
        ctx.beginPath();
        ctx.moveTo(space * i, height); //x,y
        ctx.lineTo(space * i, height - (value + value ? value: 6)); //x,y 
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
      });
    }

    ctx.clearRect(0, 0, width, height);
    renderBackground();
    renderBars();
  }

  function loop(now: number): void {
    analyser.getByteFrequencyData(sourceData);
    render(sourceData, now);
    requestAnimationFrame(loop);
  }

  audioEl.onplay = (): void => { audioCtx.resume(); };

  render(sourceData, 0);
  requestAnimationFrame(loop);
}


window.onload = init;