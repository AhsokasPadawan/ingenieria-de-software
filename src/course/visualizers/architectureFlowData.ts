export type ArchitectureKind = 'layered' | 'hexagonal' | 'ecs';

export interface ArchitectureNodeSpec {
  id: string;
  label: string;
  sublabel: string;
  role: 'external' | 'port' | 'core' | 'data' | 'system';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ArchitectureEdgeSpec {
  id: string;
  fromId: string;
  toId: string;
  kind: 'dependency' | 'flow';
  label?: string;
}

export interface ArchitectureStepFrame {
  id: string;
  title: string;
  description: string;
  activeNodeIds: readonly string[];
  activeEdgeIds: readonly string[];
  flowCaption: string;
}

export interface ArchitectureScenarioSpec {
  id: ArchitectureKind;
  tabLabel: string;
  title: string;
  dependencyRule: string;
  couplingSummary: string;
  idealUseCase: string;
  nodes: readonly ArchitectureNodeSpec[];
  edges: readonly ArchitectureEdgeSpec[];
  steps: readonly ArchitectureStepFrame[];
}

export const ARCHITECTURE_SCENARIOS: Record<ArchitectureKind, ArchitectureScenarioSpec> = {
  layered: {
    id: 'layered',
    tabLabel: 'Capas (Layered)',
    title: 'Arquitectura en Capas',
    dependencyRule: 'Hacia abajo (hacia la DB)',
    couplingSummary: 'BLL acoplada a DAL / DB',
    idealUseCase: 'CRUDs y gestión convencional',
    nodes: [
      { id: 'ui', label: 'Presentación (UI)', sublabel: 'Controllers / Vistas', role: 'external', x: 210, y: 18, width: 220, height: 46 },
      { id: 'bll', label: 'Lógica de Negocio (BLL)', sublabel: 'Servicios y Reglas', role: 'core', x: 210, y: 92, width: 220, height: 46 },
      { id: 'dal', label: 'Acceso a Datos (DAL)', sublabel: 'Repositorios / ORM', role: 'port', x: 210, y: 166, width: 220, height: 46 },
      { id: 'db', label: 'Base de Datos', sublabel: 'Motor SQL / Tablas', role: 'data', x: 210, y: 240, width: 220, height: 46 },
    ],
    edges: [
      { id: 'e-ui-bll', fromId: 'ui', toId: 'bll', kind: 'dependency', label: 'depende de' },
      { id: 'e-bll-dal', fromId: 'bll', toId: 'dal', kind: 'dependency', label: 'depende de' },
      { id: 'e-dal-db', fromId: 'dal', toId: 'db', kind: 'dependency', label: 'depende de' },
    ],
    steps: [
      {
        id: 'l-1',
        title: 'Dirección de Dependencias',
        description: 'En Capas, cada nivel conoce y depende directamente del nivel inferior. Todas las flechas apuntan hacia la Base de Datos.',
        activeNodeIds: ['ui', 'bll', 'dal', 'db'],
        activeEdgeIds: ['e-ui-bll', 'e-bll-dal', 'e-dal-db'],
        flowCaption: 'Estructura estática: UI → BLL → DAL → DB',
      },
      {
        id: 'l-2',
        title: '1. Entrada en Presentación (UI)',
        description: 'El usuario solicita registrar un pedido. La capa UI valida el formato HTTP y delega en la capa de Lógica de Negocio.',
        activeNodeIds: ['ui', 'bll'],
        activeEdgeIds: ['e-ui-bll'],
        flowCaption: 'UI invoca PedidoService.Crear()',
      },
      {
        id: 'l-3',
        title: '2. Negocio invoca Acceso a Datos',
        description: 'BLL aplica reglas de descuento y llama directamente a DAL. La lógica de negocio queda acoplada a la capa de persistencia.',
        activeNodeIds: ['bll', 'dal'],
        activeEdgeIds: ['e-bll-dal'],
        flowCaption: 'BLL invoca PedidoRepository.Guardar()',
      },
      {
        id: 'l-4',
        title: '3. Persistencia en Base de Datos',
        description: 'DAL traduce la operación a SQL y escribe en la Base de Datos. Un cambio de motor o esquema impacta hacia arriba.',
        activeNodeIds: ['dal', 'db'],
        activeEdgeIds: ['e-dal-db'],
        flowCaption: 'INSERT INTO Pedidos (...) en motor SQL',
      },
      {
        id: 'l-5',
        title: 'Síntesis: Simplicidad vs. Acoplamiento',
        description: 'Rápida de entender e implementar para CRUDs convencionales, pero difícil de testear sin base de datos real si BLL depende de DAL concreta.',
        activeNodeIds: ['bll', 'dal', 'db'],
        activeEdgeIds: ['e-bll-dal', 'e-dal-db'],
        flowCaption: 'Ideal para sistemas administrativos de complejidad moderada',
      },
    ],
  },
  hexagonal: {
    id: 'hexagonal',
    tabLabel: 'Hexagonal',
    title: 'Arquitectura Hexagonal (Puertos y Adaptadores)',
    dependencyRule: 'Hacia adentro (hacia el Núcleo)',
    couplingSummary: 'Núcleo 100% aislado',
    idealUseCase: 'Dominio complejo y testeable',
    nodes: [
      { id: 'ui', label: 'Adaptador Web / CLI', sublabel: 'Actor Primario', role: 'external', x: 20, y: 125, width: 135, height: 54 },
      { id: 'pi', label: 'Puerto Entrada', sublabel: 'ICrearPedido', role: 'port', x: 178, y: 125, width: 112, height: 54 },
      { id: 'core', label: 'NÚCLEO', sublabel: 'Reglas de Dominio', role: 'core', x: 314, y: 108, width: 128, height: 88 },
      { id: 'po', label: 'Puerto Salida', sublabel: 'IPedidoRepo', role: 'port', x: 466, y: 125, width: 112, height: 54 },
      { id: 'db', label: 'Adaptador SQL / Mock', sublabel: 'Actor Secundario', role: 'data', x: 466, y: 224, width: 148, height: 54 },
    ],
    edges: [
      { id: 'h-ui-pi', fromId: 'ui', toId: 'pi', kind: 'dependency', label: 'usa' },
      { id: 'h-pi-core', fromId: 'pi', toId: 'core', kind: 'dependency', label: 'hacia núcleo' },
      { id: 'h-po-core', fromId: 'po', toId: 'core', kind: 'dependency', label: 'pertenece a' },
      { id: 'h-core-po-flow', fromId: 'core', toId: 'po', kind: 'flow', label: 'invoca' },
      { id: 'h-db-po', fromId: 'db', toId: 'po', kind: 'dependency', label: 'implementa' },
    ],
    steps: [
      {
        id: 'h-1',
        title: 'Inversión de Dependencias',
        description: 'Todas las flechas de dependencia apuntan hacia el Núcleo. Incluso el Adaptador SQL depende de la interfaz Puerto de Salida definida por el dominio.',
        activeNodeIds: ['ui', 'pi', 'core', 'po', 'db'],
        activeEdgeIds: ['h-ui-pi', 'h-pi-core', 'h-po-core', 'h-db-po'],
        flowCaption: 'Dependencias: Adaptadores → Puertos → Núcleo',
      },
      {
        id: 'h-2',
        title: '1. Adaptador Primario entra por Puerto',
        description: 'La UI Web convierte la petición HTTP y llama al Puerto de Entrada sin que el Núcleo sepa si vino de Web, consola o un test.',
        activeNodeIds: ['ui', 'pi', 'core'],
        activeEdgeIds: ['h-ui-pi', 'h-pi-core'],
        flowCaption: 'Adaptador Web → ICrearPedido → Núcleo',
      },
      {
        id: 'h-3',
        title: '2. Núcleo ejecuta reglas puras',
        description: 'El Núcleo valida invariantes de negocio e invoca en tiempo de ejecución la interfaz IPedidoRepo (flujo hacia afuera), mientras la dependencia apunta hacia adentro.',
        activeNodeIds: ['core', 'po'],
        activeEdgeIds: ['h-core-po-flow', 'h-po-core'],
        flowCaption: 'Núcleo invoca IPedidoRepo.Guardar() sin conocer SQL',
      },
      {
        id: 'h-4',
        title: '3. Adaptador Secundario responde',
        description: 'En producción responde el Adaptador SQL; en tests unitarios se inyecta un Fake/Stub en memoria sin tocar código del Núcleo.',
        activeNodeIds: ['po', 'db'],
        activeEdgeIds: ['h-db-po'],
        flowCaption: 'Adaptador SQL (o Fake en tests) implementa IPedidoRepo',
      },
      {
        id: 'h-5',
        title: 'Síntesis: Portabilidad y Testabilidad',
        description: 'Cambiar el framework web o la base de datos solo reemplaza adaptadores externos. El dominio permanece intacto y testeable en milisegundos.',
        activeNodeIds: ['core', 'pi', 'po'],
        activeEdgeIds: ['h-pi-core', 'h-po-core'],
        flowCaption: 'Frontera protegida por interfaces (Puertos)',
      },
    ],
  },
  ecs: {
    id: 'ecs',
    tabLabel: 'ECS',
    title: 'Entity-Component-System (ECS)',
    dependencyRule: 'Systems → Components (sin herencia)',
    couplingSummary: 'Datos y lógica separados',
    idealUseCase: 'Videojuegos y simulaciones en tiempo real',
    nodes: [
      { id: 'entity', label: 'Entity #42', sublabel: 'Solo un ID numérico', role: 'core', x: 25, y: 122, width: 130, height: 56 },
      { id: 'c-pos', label: 'Position {x, y}', sublabel: 'Component (solo datos)', role: 'data', x: 220, y: 36, width: 170, height: 50 },
      { id: 'c-vel', label: 'Velocity {dx, dy}', sublabel: 'Component (solo datos)', role: 'data', x: 220, y: 125, width: 170, height: 50 },
      { id: 'c-hp', label: 'Health {hp: 100}', sublabel: 'Component (solo datos)', role: 'data', x: 220, y: 214, width: 170, height: 50 },
      { id: 's-mov', label: 'MovementSystem', sublabel: 'System (lógica pura)', role: 'system', x: 445, y: 76, width: 170, height: 54 },
      { id: 's-cmb', label: 'CombatSystem', sublabel: 'System (lógica pura)', role: 'system', x: 445, y: 186, width: 170, height: 54 },
    ],
    edges: [
      { id: 'e-id-pos', fromId: 'entity', toId: 'c-pos', kind: 'flow', label: 'asocia' },
      { id: 'e-id-vel', fromId: 'entity', toId: 'c-vel', kind: 'flow', label: 'asocia' },
      { id: 'e-id-hp', fromId: 'entity', toId: 'c-hp', kind: 'flow', label: 'asocia' },
      { id: 'e-smov-pos', fromId: 's-mov', toId: 'c-pos', kind: 'dependency', label: 'lee/escribe' },
      { id: 'e-smov-vel', fromId: 's-mov', toId: 'c-vel', kind: 'dependency', label: 'lee' },
      { id: 'e-scmb-hp', fromId: 's-cmb', toId: 'c-hp', kind: 'dependency', label: 'lee/escribe' },
    ],
    steps: [
      {
        id: 'ecs-1',
        title: 'Composición sin Herencia',
        description: 'Entity #42 es apenas un identificador. Los Components guardan datos puros sin métodos, y los Systems contienen la lógica sin estado propio.',
        activeNodeIds: ['entity', 'c-pos', 'c-vel', 'c-hp'],
        activeEdgeIds: ['e-id-pos', 'e-id-vel', 'e-id-hp'],
        flowCaption: 'Entity #42 = { Position, Velocity, Health }',
      },
      {
        id: 'ecs-2',
        title: '1. MovementSystem consulta datos',
        description: 'En cada frame, MovementSystem busca todas las entidades que tengan Position y Velocity, ignorando Health.',
        activeNodeIds: ['s-mov', 'c-pos', 'c-vel'],
        activeEdgeIds: ['e-smov-pos', 'e-smov-vel'],
        flowCaption: 'Query(Position, Velocity) → Entity #42',
      },
      {
        id: 'ecs-3',
        title: '2. Actualización de posición',
        description: 'MovementSystem escribe Position.x += Velocity.dx. Los Systems nunca se llaman entre sí; se coordinan a través de los datos.',
        activeNodeIds: ['s-mov', 'c-pos'],
        activeEdgeIds: ['e-smov-pos'],
        flowCaption: 'Position.x += Velocity.dx (sin acoplamiento entre Systems)',
      },
      {
        id: 'ecs-4',
        title: '3. CombatSystem actúa independiente',
        description: 'CombatSystem procesa Health de forma aislada. Agregar una nueva capacidad (ej. ShieldComponent) no requiere modificar jerarquías de clases.',
        activeNodeIds: ['s-cmb', 'c-hp'],
        activeEdgeIds: ['e-scmb-hp'],
        flowCaption: 'CombatSystem reduce Health.hp ante impacto',
      },
      {
        id: 'ecs-5',
        title: 'Síntesis: Alto Rendimiento y Flexibilidad',
        description: 'Maximiza localidad de caché y composición dinámica cuando existen cientos o miles de entidades con combinaciones cambiantes.',
        activeNodeIds: ['entity', 's-mov', 's-cmb', 'c-pos', 'c-vel', 'c-hp'],
        activeEdgeIds: ['e-smov-pos', 'e-smov-vel', 'e-scmb-hp'],
        flowCaption: 'Composición de datos > Jerarquías de herencia',
      },
    ],
  },
};

export const ARCHITECTURE_ORDER: readonly ArchitectureKind[] = [
  'layered',
  'hexagonal',
  'ecs',
];
