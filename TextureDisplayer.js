(function () {

  function hello(name) {
    console.log("Hello " + name);
  }

  function add(a, b) {
    return a + b;
  }

  // expose globally
  window.MyLib = {
    hello,
    add
  };

const TextureList = [];

const previews = [];
class TexturePreview {
    constructor(device, sourceTexture) {
        this.device = device;
        this.sourceTexture = sourceTexture;

        this.canvas = document.createElement("canvas");
        this.canvas.width = 128;
        this.canvas.height = 128;
        this.context = this.canvas.getContext("webgpu");
        this.format = navigator.gpu.getPreferredCanvasFormat();

        this.context.configure({
            device,
            format: this.format,
            alphaMode: "opaque"
        });
        this.init();
    }
    
    init() {
        this.shaderCode = `
@group(0) @binding(0) var tex : texture_2d<f32>;

struct VSOut {
    @builtin(position) position : vec4f,
    @location(0) uv : vec2f,
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
        const textureFormat = this.sourceTexture.format
        const sampleType =
    getSampleType(textureFormat);


     this.bindLayout =
device.createBindGroupLayout({
    entries: [{
        binding:0,
        visibility:
            GPUShaderStage.FRAGMENT,
        texture:{
            sampleType
        }
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

    render() {

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

        pass.draw(3);
        pass.end();

        this.device.queue.submit([
            encoder.finish()
        ]);
        

    }

    
}
})();