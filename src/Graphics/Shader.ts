import { Game } from '../Game'
import { RenderInstruction } from '../Graphics'
import Uniform, { UniformType } from './Uniform'
import Attribute, { AttributeType } from './Attribute'

/**
 * frag
 * vert
 * attributes
 * uniforms []
 * 
 * @export
 * @class Shader
 */
export class Shader {
  name: string
  program: WebGLProgram
  dirty: boolean = true
  sampler2D: Uniform
  uniforms: Uniform[]
  attributes: Attribute[]
  uniformsByName: { [key: string]: Uniform } = {}

  renderQueue: RenderInstruction[] = []

  constructor(data: ShaderData) {
    this.name = data.name
    const gl = Game.graphics.gl

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShader, data.vert)
    gl.compileShader(vertexShader)
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      throw new Error(
        `Shader compilation error: ${gl.getShaderInfoLog(vertexShader)}`
      )
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragmentShader, data.frag)
    gl.compileShader(fragmentShader)
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      throw new Error(
        `Shader compilation error: ${gl.getShaderInfoLog(fragmentShader)}`
      )
    }

    this.program = gl.createProgram()
    gl.attachShader(this.program, vertexShader)
    gl.attachShader(this.program, fragmentShader)
    gl.linkProgram(this.program)

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      throw new Error(
        `Unable to initialize the shader program: ${gl.getProgramInfoLog(
          this.program
        )}`
      )
    }

    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)

    this.attributes = data.attributes.map(a => {
      const attribute = new Attribute(a.name, a.type)
      attribute.attribute = gl.getAttribLocation(this.program, attribute.name)
      return attribute
    })

    this.uniforms = data.uniforms.map(u => {
      const uniform = new Uniform(u.name, u.type, u.value)
      uniform.shader = this
      uniform.uniform = gl.getUniformLocation(this.program, uniform.name)

      if (uniform.type === UniformType.sampler2D && !this.sampler2D) {
        this.sampler2D = uniform
      }

      this.uniformsByName[uniform.name] = uniform

      return uniform
    })
  }

  set(name: string, value: any) {
    if (!this.uniformsByName[name]) {
      throw new Error(`Uniform ${name} does not exist on this shader.`)
    }
    this.uniformsByName[name].value = value
  }
}

export interface ShaderData {
  name: string
  frag: string
  vert: string
  uniforms: { name: string; type: UniformType; value?: any }[]
  attributes: { name: string; type: AttributeType }[]
}
