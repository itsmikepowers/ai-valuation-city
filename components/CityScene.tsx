"use client";

import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, ContactShadows } from "@react-three/drei";
import {
  Component,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import gsap from "gsap";
import { Category, Company, companies, districts } from "@/lib/data";
import {
  money,
  overview,
  positionFor,
  recordAt,
  scaleFor,
  seeded,
  stateAt,
} from "@/lib/city";

export type CameraRequest = {
  id: number;
  company?: string;
  district?: Category;
  home?: boolean;
};
export interface SceneProps {
  entered: boolean;
  date: string;
  selected: string | null;
  highlighted: string | null;
  comparison: string[];
  comparing: boolean;
  labels: boolean;
  reducedMotion: boolean;
  request: CameraRequest;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onReady: () => void;
}
type Block = {
  p: [number, number, number];
  s: [number, number, number];
  c: string;
  glow?: boolean;
};
const cube = new THREE.BoxGeometry(1, 1, 1);
const dummy = new THREE.Object3D();

function Instances({
  blocks,
  glow = false,
}: {
  blocks: Block[];
  glow?: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    blocks.forEach((b, i) => {
      dummy.position.set(...b.p);
      dummy.scale.set(...b.s);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
      ref.current!.setColorAt(i, new THREE.Color(b.c));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [blocks]);
  if (!blocks.length) return null;
  return (
    <instancedMesh
      ref={ref}
      args={[cube, undefined, blocks.length]}
      castShadow={!glow}
      receiveShadow={!glow}
    >
      {glow ? (
        <meshBasicMaterial toneMapped={false} />
      ) : (
        <meshStandardMaterial roughness={0.86} metalness={0.18} />
      )}
    </instancedMesh>
  );
}

function architecture(company: Company) {
  const random = seeded(company.buildingSeed);
  const { width: w } = scaleFor(recordAt(company, "2026-12-31")?.amount ?? 0);
  const color = districts[company.category].color;
  const blocks: Block[] = [],
    windows: Block[] = [];
  const add = (p: Block["p"], s: Block["s"], c: string) =>
    blocks.push({ p, s, c });
  const facade =
    company.category === "Code"
      ? "#242a3b"
      : company.category === "Media"
        ? "#55525b"
        : company.category === "Robotics"
          ? "#51544e"
          : "#35494b";
  add([0, 0.035, 0], [w + 1.4, 0.07, w + 1.4], "#465653");
  if (company.id === "openai") {
    add([-w * 0.22, 0.48, 0], [w * 0.48, 0.88, w * 0.77], "#536b67");
    add([w * 0.24, 0.43, 0], [w * 0.42, 0.78, w], "#405b58");
    add([0, 0.86, 0], [w * 0.9, 0.075, w * 0.78], "#739084");
    add([-w * 0.22, 0.95, 0], [w * 0.46, 0.1, w * 0.73], "#adc8ac");
    add([-w * 0.22, 1.06, 0], [0.3, 0.15, 0.3], color);
  } else if (company.id === "anthropic") {
    for (let i = 0; i < 4; i++)
      add(
        [0, 0.17 + i * 0.23, 0],
        [w * (1 - i * 0.16), 0.24, w * (1 - i * 0.13)],
        i % 2 ? "#7d6756" : "#625646",
      );
    add([0, 0.99, 0], [w * 0.42, 0.045, w * 0.48], "#e8c4a4");
  } else if (company.id === "xai") {
    add([-w * 0.28, 0.52, 0], [w * 0.3, 0.94, w * 0.66], "#43515c");
    add([w * 0.28, 0.44, 0], [w * 0.3, 0.78, w * 0.66], "#43515c");
    add([0, 0.72, 0], [w * 0.85, 0.11, w * 0.7], "#a8b3b4");
    add([0, 0.23, 0], [w, 0.3, w], facade);
  } else if (company.id === "databricks") {
    for (let i = 0; i < 5; i++)
      add(
        [i % 2 ? 0.5 : -0.5, 0.14 + i * 0.18, 0],
        [w, 0.16, w * 0.8],
        i % 2 ? "#7d554c" : "#a4725c",
      );
  } else if (company.category === "Robotics") {
    add([0, 0.24, 0], [w * 1.2, 0.43, w], facade);
    add([w * 0.26, 0.63, -w * 0.2], [w * 0.4, 0.7, w * 0.45], "#7b7d6a");
    for (let i = 0; i < 3; i++)
      add(
        [-w * 0.4 + i * w * 0.25, 0.5, w * 0.2],
        [w * 0.17, 0.12, w * 0.6],
        "#a09a76",
      );
  } else if (company.category === "Media") {
    const audio = company.id === "elevenlabs" || company.id === "suno";
    for (let i = 0; i < 5; i++) {
      const h = audio
        ? 0.45 + 0.5 * Math.sin(((i + 1) * Math.PI) / 6)
        : 0.4 + (i % 3) * 0.23;
      add([(i - 2) * w * 0.2, h / 2, 0], [w * 0.185, h, w * 0.8], facade);
      add([(i - 2) * w * 0.2, h, 0], [w * 0.19, 0.03, w * 0.82], color);
    }
  } else if (company.category === "Code") {
    add([0, 0.47, 0], [w * 0.8, 0.94, w * 0.8], facade);
    for (let i = 0; i < 6; i++)
      add([0, 0.12 + i * 0.15, 0], [w * 0.92, 0.035, w * 0.9], "#687082");
    add([0, 1, 0], [w * 0.48, 0.1, w * 0.48], "#383d50");
  } else if (company.category === "Data") {
    add([0, 0.3, 0], [w * 1.2, 0.6, w], facade);
    add([0, 0.75, 0], [w * 0.7, 0.4, w * 0.68], "#607887");
  } else {
    add([0, 0.42, 0], [w, 0.84, w * 0.78], facade);
    add([0, 0.91, 0], [w * 0.68, 0.16, w * 0.58], "#6b8378");
    for (let i = -1; i <= 1; i++)
      add([i * w * 0.3, 0.42, w * 0.4], [0.25, 0.82, 0.3], "#a0aaa1");
  }
  // Windows are instanced and sit on each actual architectural face.
  blocks.slice().forEach((b) => {
    if (b.s[1] < 0.1) return;
    const rows = Math.max(2, Math.floor(b.s[1] * 30));
    const cols = Math.max(2, Math.floor(b.s[0] / 1.15));
    for (let row = 0; row < rows; row++)
      for (let col = 0; col < cols; col++) {
        if (random() < 0.32) continue;
        const c = random() > 0.2 ? "#d6c995" : color;
        const y = b.p[1] - b.s[1] / 2 + ((row + 0.5) * b.s[1]) / rows;
        windows.push({
          p: [
            b.p[0] - b.s[0] / 2 + ((col + 0.5) * b.s[0]) / cols,
            y,
            b.p[2] + b.s[2] / 2 + 0.025,
          ],
          s: [0.43, 0.009, 0.035],
          c,
        });
        windows.push({
          p: [
            b.p[0] + b.s[0] / 2 + 0.025,
            y,
            b.p[2] - b.s[2] / 2 + ((col + 0.5) * b.s[2]) / cols,
          ],
          s: [0.035, 0.009, 0.43],
          c,
        });
      }
  });
  add([0, 1.04, -w * 0.15], [w * 0.2, 0.07, w * 0.22], "#87938f");
  return { blocks, windows, w };
}

function Logo({ company }: { company: Company }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className="logo-fallback">{company.name.slice(0, 2)}</span>
  ) : (
    // Remote favicon is decorative; the company wordmark remains legible on failure.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt=""
      src={`https://www.google.com/s2/favicons?domain=${company.domain}&sz=128`}
      onError={() => setFailed(true)}
      draggable={false}
    />
  );
}

function Building({
  company,
  index,
  ...props
}: SceneProps & { company: Company; index: number }) {
  const label = useRef<HTMLButtonElement>(null);
  const labelPosition = useMemo(() => new THREE.Vector3(), []);
  const root = useRef<THREE.Group>(null),
    body = useRef<THREE.Group>(null),
    sign = useRef<THREE.Group>(null);
  const design = useMemo(() => architecture(company), [company]);
  const record = recordAt(company, props.date),
    state = stateAt(company, props.date);
  const h = record ? scaleFor(record.amount).height : 1.5;
  const selected = props.selected === company.id;
  const active = selected || props.highlighted === company.id;
  const slot = props.comparison.indexOf(company.id);
  const isCompared = props.comparing && slot >= 0;
  const original = positionFor(company);
  const target: [number, number, number] = isCompared
    ? [(slot - (props.comparison.length - 1) / 2) * 25, 1, 133]
    : original;
  const visible = state !== "absent" && (!props.comparing || slot >= 0);
  useFrame(({ camera }, dt) => {
    if (label.current && sign.current) {
      sign.current.getWorldPosition(labelPosition);
      const distance = camera.position.distanceTo(labelPosition);
      label.current.style.scale = String(Math.min(1, (distance * 0.788) / 150));
    }
    const speed = props.reducedMotion ? 1 : 1 - Math.exp(-dt * 4);
    if (root.current) {
      root.current.position.x = THREE.MathUtils.lerp(
        root.current.position.x,
        target[0],
        speed,
      );
      root.current.position.z = THREE.MathUtils.lerp(
        root.current.position.z,
        target[2],
        speed,
      );
      root.current.position.y = THREE.MathUtils.lerp(
        root.current.position.y,
        target[1] + 0.4,
        speed,
      );
      const scale = THREE.MathUtils.lerp(
        root.current.scale.x,
        visible ? 1 : 0.001,
        speed,
      );
      root.current.scale.setScalar(scale);
      root.current.visible = scale > 0.005;
    }
    if (body.current)
      body.current.scale.y = THREE.MathUtils.lerp(
        body.current.scale.y,
        h,
        speed,
      );
    if (sign.current)
      sign.current.position.y = THREE.MathUtils.lerp(
        sign.current.position.y,
        h * 1.13 + 2,
        speed,
      );
  });
  const select = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (event.delta < 5) props.onSelect(company.id);
  };
  return (
    <group ref={root} position={original}>
      <group
        ref={body}
        scale={[1, h, 1]}
        onClick={select}
        onDoubleClick={select}
        onPointerOver={(e) => {
          e.stopPropagation();
          props.onHover(company.id);
        }}
        onPointerOut={() => props.onHover(null)}
      >
        <Instances blocks={design.blocks} />
        {state === "built" && <Instances blocks={design.windows} glow />}
        {active && (
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[design.w * 1.3, 1.1, design.w * 1.25]} />
            <meshBasicMaterial
              color={districts[company.category].color}
              wireframe
              transparent
              opacity={0.8}
            />
          </mesh>
        )}
      </group>
      {(state === "construction" ||
        (record &&
          new Date(props.date).getTime() - new Date(record.date).getTime() <
            1000 * 86400 * 100)) && (
        <group position={[-design.w / 2 - 1, 0, 0]}>
          <mesh position={[0, h * 0.6, 0]}>
            <boxGeometry args={[0.35, h * 1.2 + 3, 0.35]} />
            <meshStandardMaterial color="#ddb56b" />
          </mesh>
          <mesh position={[3, h * 1.2 + 1.5, 0]}>
            <boxGeometry args={[9, 0.35, 0.4]} />
            <meshStandardMaterial color="#ddb56b" />
          </mesh>
          <mesh position={[6, h * 0.85, 0]}>
            <boxGeometry args={[0.07, h * 0.7 + 3, 0.07]} />
            <meshStandardMaterial color="#d1c7a0" />
          </mesh>
        </group>
      )}
      <group ref={sign} position={[0, h * 1.13 + 2, 0]}>
        {(props.labels || active || isCompared) && visible && (
          <Html
            center
            zIndexRange={[20, 0]}
            distanceFactor={150}
            style={{ pointerEvents: "none" }}
          >
            <button
              ref={label}
              tabIndex={props.entered ? 0 : -1}
              className={`building-sign ${active ? "active" : ""} ${index < 3 ? "landmark-sign" : ""}`}
              style={
                {
                  "--district": districts[company.category].color,
                } as React.CSSProperties
              }
              onClick={() => props.onSelect(company.id)}
              aria-label={`Select ${company.name}`}
            >
              <Logo company={company} />
              <span>
                {company.name}
                <strong>
                  {record ? money(record.amount) : "No recorded valuation"}
                </strong>
              </span>
            </button>
          </Html>
        )}
      </group>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[design.w + 3, 0.1, design.w + 3]} />
        <meshStandardMaterial color={active ? "#739a88" : "#344240"} />
      </mesh>
    </group>
  );
}

function Environment({
  quiet,
  reducedMotion,
}: {
  quiet: boolean;
  reducedMotion: boolean;
}) {
  const { blocks, lights } = useMemo(() => {
    const blocks: Block[] = [],
      lights: Block[] = [];
    const add = (p: Block["p"], s: Block["s"], c: string, glow = false) =>
      (glow ? lights : blocks).push({ p, s, c });
    const random = seeded(75432);
    // Floating island, road grid, curbs, lane markings and crosswalks.
    add([0, -2, 9], [126, 4, 136], "#202e30");
    add([0, -0.1, 9], [125, 0.3, 135], "#3d4a47");
    for (const x of [-59, 0, 59]) {
      add([x, 0.08, 9], [6, 0.2, 134], "#1c272a");
      for (let z = -55; z < 74; z += 5)
        add([x, 0.2, z], [0.14, 0.03, 1.8], "#8d8a6c");
    }
    for (const z of [-56, -5, 35, 74]) {
      add([0, 0.08, z], [124, 0.2, 6], "#1c272a");
      for (let x = -56; x < 59; x += 5)
        add([x, 0.2, z], [1.8, 0.03, 0.14], "#8d8a6c");
      for (const x of [-59, 0, 59])
        for (let k = -2; k <= 2; k++) {
          add([x + k * 0.8, 0.22, z + 4], [0.5, 0.04, 1.5], "#a7afa5");
          add([x + 4, 0.22, z + k * 0.8], [1.5, 0.04, 0.5], "#a7afa5");
        }
    }
    for (const [i, d] of Object.values(districts).entries()) {
      const [x, z] = d.center;
      add([x, 0.2, z + 4], [51, 0.4, i === 0 || i === 1 ? 35 : 27], "#4b5650");
      // Parks and plazas on the open side of each block.
      add([x, 0.48, z + 14], [31, 0.15, 5], "#354c3c");
      for (let j = 0; j < 13; j++) {
        const tx = x - 23 + random() * 46,
          tz = z + 11 + random() * 6;
        if (i === 0 && tx < x + 7) continue;
        const h = 1.2 + random() * 1.3;
        add([tx, h / 2 + 0.5, tz], [0.3, h, 0.3], "#655a43");
        add(
          [tx, h + 1, tz],
          [1.5, 1.6, 1.5],
          ["#567a55", "#43674d", "#718464"][j % 3],
        );
        add([tx, h + 2, tz], [0.85, 0.65, 0.85], "#63805a");
      }
      for (let j = -1; j <= 1; j++) {
        add([x + j * 9, 0.9, z + 18], [2.1, 0.2, 0.7], "#a28b64");
        add([x + j * 9, 0.6, z + 18], [0.3, 0.6, 0.6], "#35433e");
      }
    }
    for (const x of [-55, 4, 55])
      for (let z = -49; z < 75; z += 12) {
        add([x, 2, z], [0.18, 4, 0.18], "#6a766a");
        add([x + 0.7, 4, z], [1.5, 0.18, 0.25], "#929987");
        add([x + 1.2, 3.85, z], [0.7, 0.15, 0.5], "#f3dbae", true);
        add([x + 1, 0.25, z], [2.4, 0.015, 2.4], "#766d4e");
      }
    // Café, solar array, roof HVAC, server cabinets, a helipad and service buildings.
    for (let i = 0; i < 12; i++) {
      const x = -49 + i * 9;
      add([x, 1.1, 65], [4, 1.7, 3], "#46514c");
      add([x, 2.1, 65], [4.4, 0.25, 3.5], i % 3 ? "#6a796c" : "#ba9264");
      add([x, 1.2, 66.55], [2.6, 0.7, 0.06], "#d2bd8d", true);
      add([x - 0.7, 2.5, 65], [0.8, 0.6, 0.8], "#9da89b");
    }
    add([-30, 0.6, -16], [8, 0.1, 7], "#68796a");
    add([-31, 0.68, -16], [0.4, 0.03, 3], "#cad1b5");
    add([-29, 0.68, -16], [0.4, 0.03, 3], "#cad1b5");
    add([-30, 0.68, -16], [2, 0.03, 0.4], "#cad1b5");
    return { blocks, lights };
  }, []);
  return (
    <group visible={!quiet}>
      <Instances blocks={blocks} />
      <Instances blocks={lights} glow />
      <Traffic reducedMotion={reducedMotion} />
      {Object.entries(districts).map(([key, d]) => (
        <Html
          key={key}
          position={[d.center[0], 1.2, d.center[1] + 22]}
          center
          distanceFactor={155}
          zIndexRange={[4, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="district-sign" style={{ color: d.color }}>
            <i />
            {d.label}
          </div>
        </Html>
      ))}
      <Html
        position={[46, 4, 65]}
        center
        distanceFactor={130}
        zIndexRange={[4, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div className="cafe-sign">
          HUMAN COFFEE
          <br />
          <small>NO PROMPT REQUIRED.</small>
        </div>
      </Html>
    </group>
  );
}

function Traffic({ reducedMotion }: { reducedMotion: boolean }) {
  const cars = useRef<THREE.InstancedMesh>(null),
    people = useRef<THREE.InstancedMesh>(null);
  const colors = useMemo(
    () =>
      Array.from(
        { length: 32 },
        (_, i) =>
          new THREE.Color(["#d1bc85", "#82a5ad", "#d5d3bf", "#a36854"][i % 4]),
      ),
    [],
  );
  useLayoutEffect(() => {
    colors.forEach((c, i) => cars.current?.setColorAt(i, c));
  }, [colors]);
  useFrame(({ clock }) => {
    const t = reducedMotion ? 0 : clock.elapsedTime;
    for (let i = 0; i < 32; i++) {
      const vertical = i % 2 === 0,
        lane = i % 4 < 2 ? 1 : -1;
      const step = (i * 17 + t * ((i % 3) + 2)) % (vertical ? 130 : 118);
      dummy.position.set(
        vertical ? [-59, 0, 59][i % 3] + lane * 1.4 : -59 + step,
        0.62,
        vertical ? -56 + step : [-56, -5, 35, 74][i % 4] + lane * 1.4,
      );
      dummy.rotation.set(0, vertical ? 0 : Math.PI / 2, 0);
      dummy.scale.set(0.8, i % 7 === 0 ? 0.9 : 0.5, i % 7 === 0 ? 2.9 : 1.7);
      dummy.updateMatrix();
      cars.current?.setMatrixAt(i, dummy.matrix);
    }
    for (let i = 0; i < 48; i++) {
      dummy.position.set(
        i % 2 ? 4.2 : -4.2,
        0.85,
        -51 + ((i * 7.9 + t * 0.65) % 120),
      );
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(0.26, 0.75, 0.27);
      dummy.updateMatrix();
      people.current?.setMatrixAt(i, dummy.matrix);
    }
    if (cars.current) cars.current.instanceMatrix.needsUpdate = true;
    if (people.current) people.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <instancedMesh
        ref={cars}
        args={[cube, undefined, 32]}
        frustumCulled={false}
      >
        <meshStandardMaterial roughness={0.7} />
      </instancedMesh>
      <instancedMesh
        ref={people}
        args={[cube, undefined, 48]}
        frustumCulled={false}
      >
        <meshStandardMaterial color="#cbb795" />
      </instancedMesh>
    </>
  );
}

function CameraRig({
  entered,
  request,
  comparing,
  comparison,
  date,
  reducedMotion,
}: SceneProps) {
  const controls = useRef<OrbitControlsImpl>(null),
    animation = useRef<gsap.core.Timeline | null>(null);
  const { camera, size } = useThree();
  const aspect = size.width / size.height;
  useEffect(() => {
    const orbit = controls.current;
    if (!orbit) return;
    let position = [...overview.position],
      target = [...overview.target];
    if (!entered) {
      position = [178, 173, 209];
      target = [0, 10, 10];
    } else if (comparing) {
      const maxH = Math.max(
        ...comparison.map(
          (id) =>
            scaleFor(
              recordAt(
                companies.find((c) => c.id === id)!,
                date,
              )?.amount ?? 0,
            ).height,
        ),
        20,
      );
      const distance = Math.max(100, maxH * 3.5);
      target = [0, maxH * 0.1, 133];
      position = [distance * 0.22, maxH * 0.5 + 20, 133 + distance];
    } else if (request.company) {
      const company = companies.find((c) => c.id === request.company)!;
      const [x, , z] = positionFor(company),
        h = scaleFor(recordAt(company, date)?.amount ?? 0).height;
      target = [x, h * 0.55, z];
      position = [
        x + Math.max(28, h * 1.15),
        h * 0.85 + 25,
        z + Math.max(38, h * 1.6),
      ];
    } else if (request.district) {
      const [x, z] = districts[request.district].center;
      target = [x, 8, z];
      position = [x + 49, 62, z + 64];
    }
    const fit = aspect < 1 ? 1.95 : 1;
    position = position.map((n, i) => target[i] + (n - target[i]) * fit);
    animation.current?.kill();
    animation.current = gsap
      .timeline({
        defaults: {
          duration: reducedMotion ? 0 : entered ? 1.9 : 0,
          ease: "power3.inOut",
        },
        onUpdate: () => orbit.update(),
      })
      .to(
        camera.position,
        { x: position[0], y: position[1], z: position[2] },
        0,
      )
      .to(orbit.target, { x: target[0], y: target[1], z: target[2] }, 0);
    return () => {
      animation.current?.kill();
    };
    // Date changes grow the skyline without resetting the user's orbit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entered, request, comparing, comparison, camera, reducedMotion, aspect]);
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enabled={entered}
      enableDamping
      dampingFactor={0.065}
      minDistance={8}
      maxDistance={370}
      maxPolarAngle={Math.PI / 2 - 0.025}
      minPolarAngle={0.12}
      zoomSpeed={0.65}
      panSpeed={0.65}
      rotateSpeed={0.55}
      onStart={() => animation.current?.kill()}
    />
  );
}

function World(props: SceneProps) {
  const light = useRef<THREE.AmbientLight>(null);
  const shadowTime = useRef(3);
  useEffect(() => {
    shadowTime.current = 3;
  }, [props.date, props.comparing, props.comparison]);
  useFrame(({ gl }, dt) => {
    gl.shadowMap.needsUpdate = shadowTime.current > 0;
    shadowTime.current = Math.max(0, shadowTime.current - dt);
  });
  const { onReady } = props;
  useEffect(() => onReady(), [onReady]);
  useFrame((_, dt) => {
    if (light.current)
      light.current.intensity = THREE.MathUtils.damp(
        light.current.intensity,
        props.entered ? 1.25 : 0.55,
        1.5,
        dt,
      );
  });
  return (
    <>
      <color attach="background" args={["#0c1518"]} />
      <fog attach="fog" args={["#0c1518", 210, 520]} />
      <ambientLight ref={light} intensity={0.3} />
      <hemisphereLight args={["#b7d6d4", "#263326", 1.65]} />
      <directionalLight
        position={[30, 95, 35]}
        intensity={2.3}
        color="#ffe2b1"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-90}
        shadow-camera-right={90}
        shadow-camera-top={110}
        shadow-camera-bottom={-90}
        shadow-camera-far={260}
        shadow-normalBias={0.1}
      />
      <directionalLight
        position={[-60, 40, -60]}
        intensity={1.6}
        color="#739bb9"
      />
      {!props.comparing && (
        <Environment quiet={false} reducedMotion={props.reducedMotion} />
      )}
      {companies.map((company, index) => (
        <Building key={company.id} company={company} index={index} {...props} />
      ))}
      <group visible={props.comparing} position={[0, -0.5, 133]}>
        <mesh receiveShadow>
          <boxGeometry args={[110, 2, 30]} />
          <meshStandardMaterial color="#344943" />
        </mesh>
        <mesh position={[0, 1.05, 14.3]}>
          <boxGeometry args={[108, 0.08, 0.12]} />
          <meshBasicMaterial color="#c5e7a4" />
        </mesh>
      </group>
      <ContactShadows
        position={[0, -4.1, 10]}
        opacity={0.3}
        scale={230}
        blur={2}
        far={100}
        frames={1}
        resolution={256}
      />
      <CameraRig {...props} />
    </>
  );
}

class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="scene-error">
        <h2>The city needs WebGL</h2>
        <p>
          Enable hardware acceleration and reload to explore in 3D. Company data
          is still available in Rankings.
        </p>
        <button onClick={() => location.reload()}>Reload city</button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function CityScene(props: SceneProps) {
  return (
    <SceneBoundary>
      <Canvas
        onCreated={({ gl }) => {
          gl.shadowMap.autoUpdate = false;
        }}
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [178, 173, 209], fov: 43, near: 0.1, far: 650 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onPointerMissed={() => props.onHover(null)}
      >
        <World {...props} />
      </Canvas>
    </SceneBoundary>
  );
}
