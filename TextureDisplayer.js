
let canvas
let renderer
console.log("YUP INITIALIZaED")

function resize() {

    if(!canvas) return;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
}

resize();
window.addEventListener("resize", resize);


function getSampleType(format) {

    switch(format) {

        case "r32float":
        case "rg32float":
        case "rgba32float":
            return "unfilterable-float";

        case "rgba16float":
        case "rg16float":
        case "r16float":
            return "float";

        case "rgba8unorm":
        case "bgra8unorm":
            return "float";

        case "rgba32uint":
            return "uint";

        case "rgba32sint":
            return "sint";

        default:
            throw new Error(
                "Unsupported format: " + format
            );
    }
}


(function () {
    

  async function DisplayTexture(device, sourceTexture, id) {
    if(savedTextures.length > 4) return;
    device = device

    if(!renderer){
            renderer = new Renderer(device, sourceTexture.format)
    } 
    savedTextures.push(sourceTexture)
  }



  // expose globally
  console.log("YEAHAHA")
  window.TextureDisplayer = {
    DisplayTexture,
  };
const savedTextures = [];

const previews = [];

function normalizeToRGBA(imageData) {
  // expand channels to RGBA
}

class Renderer {
    constructor(device, format) {
        this.device = device;
        this.canvas = document.createElement("canvas");
             this.canvas.style.position = "fixed";
             this.canvas.style.top = "0";
             this.canvas.style.left = "0";
             this.canvas.style.width = "100vw";
             this.canvas.style.height = "100vh";
             this.format = format
        this.init();
    }
    
    init() {
        this.shaderCode = `
@group(0) @binding(0) var textures : texture_2d_array<f32>;

struct VSOut {
  @builtin(position) pos: vec4<f32>,
  @location(0) uv: vec2<f32>,
  @location(1) texIndex: u32,
};

@vertex
fn vs(
    @builtin(vertex_index) i : u32
) -> VSOut {

    var pos = array(
        vec2f(-1.0, -1.0),
        vec2f( 3.0, -1.0),
        vec2f(-1.0,  3.0)
    );

    var uv = array(
        vec2f(0.0, 1.0),
        vec2f(2.0, 1.0),
        vec2f(0.0, -1.0)
    );

    var out : VSOut;
    out.position = vec4f(pos[i], 0.0, 1.0);
    out.uv = uv[i];
    return out;
}

@fragment
fn fs(in : VSOut) -> @location(0) vec4f {

    let size = textureDimensions(tex);

    let coord = vec2i(
        in.uv * vec2f(size)
    );
    let c = textureLoad(
        tex,
        coord,
        0
    );

    return vec4f(c.x * 4, c.y * 4, c.z  * 4,c.w * 4) ;
}
`;
               this.module = this.device.createShaderModule({
            code: this.shaderCode
        });
        const textureFormat = this.format
        const sampleType =
    getSampleType(textureFormat);

const textureArray = this.device.createTexture({
  size: [256,256, savedTextures.length],
  format: "rgba8unorm",
  usage:
    GPUTextureUsage.TEXTURE_BINDING |
    GPUTextureUsage.COPY_DST
});
for (let i = 0; i < savedTextures.length; i++) {
  this.device.queue.copyExternalImageToTexture(
    { source: textures[i] },
    {
      texture: textureArray,
      origin: [0, 0, i] //  layer index
    },
    [width, height]
  );
}
     this.bindLayout =
this.device.createBindGroupLayout({
    entries: [{
        binding:0,
        visibility:
            GPUShaderStage.FRAGMENT,
        texture:textureArray
    }]
});
        this.bindLayout =
            this.device.createBindGroupLayout({
                entries: [
                    {
                        binding: 0,
                        visibility:
                            GPUShaderStage.FRAGMENT |
                            GPUShaderStage.VERTEX,
                        texture: {
                            sampleType: sampleType
                        }
                    }
                    
                ]
            });

        this.bindGroup =
            this.device.createBindGroup({
                layout: this.bindLayout,
                entries: [
                    {
                        binding: 0,
                        resource:
                            this.sourceTexture.createView()
                    }
                ]
            });

        this.pipeline =
            this.device.createRenderPipeline({
                layout:
                    this.device.createPipelineLayout({
                        bindGroupLayouts: [
                            this.bindLayout
                        ]
                    }),

                vertex: {
                    module: this.module,
                    entryPoint: "vs"
                },

                fragment: {
                    module: this.module,
                    entryPoint: "fs",
                    targets: [{
                        format: this.format
                    }]
                },

                primitive: {
                    topology: "triangle-list"
                }
            });
    
        
}

    render(textureIndex) {

        const encoder =
            this.device.createCommandEncoder();

        const pass =
            encoder.beginRenderPass({
                colorAttachments: [{
                    view:
                        this.context
                            .getCurrentTexture()
                            .createView(),
                    loadOp: "clear",
                    storeOp: "store"
                }]
            });


        pass.setPipeline(this.pipeline);
        pass.setBindGroup(0, this.bindGroup);

        pass.draw(3, textureIndex);
        Console.log("YUP RENDERING")
        pass.end();

        this.device.queue.submit([
            encoder.finish()
        ]);
        

    }

    
}
})();