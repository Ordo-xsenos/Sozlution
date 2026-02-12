'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

type AntigravityProps = {
  count?: number
  magnetRadius?: number
  ringRadius?: number
  waveSpeed?: number
  waveAmplitude?: number
  particleSize?: number
  lerpSpeed?: number
  color?: string
  autoAnimate?: boolean
  particleVariance?: number
  rotationSpeed?: number
  depthFactor?: number
  pulseSpeed?: number
  particleShape?: 'capsule' | 'sphere' | 'box' | 'tetrahedron'
  fieldStrength?: number
}

function AntigravityInner({
  count = 300,
  magnetRadius = 10,
  ringRadius = 10,
  waveSpeed = 0.4,
  waveAmplitude = 1,
  particleSize = 1.5,
  lerpSpeed = 0.08,
  color = '#5227FF',
  autoAnimate = true,
  particleVariance = 1,
  rotationSpeed = 0,
  depthFactor = 1,
  pulseSpeed = 3,
  particleShape = 'capsule',
  fieldStrength = 10,
}: AntigravityProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const { viewport } = useThree()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const lastMousePos = useRef({ x: 0, y: 0 })
  const lastMouseMoveTime = useRef(0)
  const virtualMouse = useRef({ x: 0, y: 0 })
  const globalPointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const nx = (event.clientX / window.innerWidth) * 2 - 1
      const ny = -((event.clientY / window.innerHeight) * 2 - 1)
      globalPointer.current = { x: nx, y: ny }
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [])

  const particles = useMemo(() => {
    const temp: Array<{
      t: number
      speed: number
      mx: number
      my: number
      mz: number
      cx: number
      cy: number
      cz: number
      randomRadiusOffset: number
    }> = []
    const width = viewport.width || 100
    const height = viewport.height || 100
    for (let i = 0; i < count; i += 1) {
      const t = Math.random() * 100
      const speed = 0.01 + Math.random() / 200
      const x = (Math.random() - 0.5) * width
      const y = (Math.random() - 0.5) * height
      const z = (Math.random() - 0.5) * 20
      temp.push({
        t,
        speed,
        mx: x,
        my: y,
        mz: z,
        cx: x,
        cy: y,
        cz: z,
        randomRadiusOffset: (Math.random() - 0.5) * 2,
      })
    }
    return temp
  }, [count, viewport.width, viewport.height])

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return

    const v = state.viewport
    const m = globalPointer.current
    const mouseDist = Math.hypot(m.x - lastMousePos.current.x, m.y - lastMousePos.current.y)
    if (mouseDist > 0.001) {
      lastMouseMoveTime.current = Date.now()
      lastMousePos.current = { x: m.x, y: m.y }
    }

    let destX = (m.x * v.width) / 2
    let destY = (m.y * v.height) / 2
    if (autoAnimate && Date.now() - lastMouseMoveTime.current > 2000) {
      const time = state.clock.getElapsedTime()
      destX = Math.sin(time * 0.5) * (v.width / 4)
      destY = Math.cos(time) * (v.height / 4)
    }

    virtualMouse.current.x += (destX - virtualMouse.current.x) * 0.05
    virtualMouse.current.y += (destY - virtualMouse.current.y) * 0.05

    const targetX = virtualMouse.current.x
    const targetY = virtualMouse.current.y
    const globalRotation = state.clock.getElapsedTime() * rotationSpeed

    particles.forEach((p, i) => {
      p.t += p.speed / 2
      const projectionFactor = 1 - p.cz / 50
      const projectedTargetX = targetX * projectionFactor
      const projectedTargetY = targetY * projectionFactor
      const dx = p.mx - projectedTargetX
      const dy = p.my - projectedTargetY
      const dist = Math.hypot(dx, dy)

      let targetPos = { x: p.mx, y: p.my, z: p.mz * depthFactor }
      if (dist < magnetRadius) {
        const angle = Math.atan2(dy, dx) + globalRotation
        const wave = Math.sin(p.t * waveSpeed + angle) * (0.5 * waveAmplitude)
        const deviation = p.randomRadiusOffset * (5 / (fieldStrength + 0.1))
        const currentRingRadius = ringRadius + wave + deviation
        targetPos = {
          x: projectedTargetX + currentRingRadius * Math.cos(angle),
          y: projectedTargetY + currentRingRadius * Math.sin(angle),
          z: p.mz * depthFactor + Math.sin(p.t) * waveAmplitude * depthFactor,
        }
      }

      p.cx += (targetPos.x - p.cx) * lerpSpeed
      p.cy += (targetPos.y - p.cy) * lerpSpeed
      p.cz += (targetPos.z - p.cz) * lerpSpeed

      dummy.position.set(p.cx, p.cy, p.cz)
      dummy.lookAt(projectedTargetX, projectedTargetY, p.cz)
      dummy.rotateX(Math.PI / 2)

      const currentDist = Math.hypot(p.cx - projectedTargetX, p.cy - projectedTargetY)
      const distFromRing = Math.abs(currentDist - ringRadius)
      const ringFactor = Math.max(0, Math.min(1, 1 - distFromRing / 10))
      const finalScale = ringFactor * (0.8 + Math.sin(p.t * pulseSpeed) * 0.2 * particleVariance) * particleSize
      dummy.scale.set(finalScale, finalScale, finalScale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {particleShape === 'capsule' && <capsuleGeometry args={[0.1, 0.4, 4, 8]} />}
      {particleShape === 'sphere' && <sphereGeometry args={[0.2, 16, 16]} />}
      {particleShape === 'box' && <boxGeometry args={[0.3, 0.3, 0.3]} />}
      {particleShape === 'tetrahedron' && <tetrahedronGeometry args={[0.3]} />}
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </instancedMesh>
  )
}

export default function Antigravity(props: AntigravityProps) {
  return (
    <Canvas camera={{ position: [0, 0, 50], fov: 35 }}>
      <AntigravityInner {...props} />
    </Canvas>
  )
}
