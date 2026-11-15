export type ChessDiTabKind = 'command' | 'di';

export type ChessPieceColor = 'white' | 'black';

export interface ChessBoardPiece {
  id: string;
  symbol: string;
  label: string;
  color: ChessPieceColor;
  row: number;
  col: number;
}

export interface CommandStackEntry {
  id: string;
  signature: string;
  capturedLabel?: string;
}

export interface ChessCommandStepFrame {
  id: string;
  title: string;
  description: string;
  actionTag: string;
  pieces: readonly ChessBoardPiece[];
  highlightedSquares: readonly string[];
  commandStack: readonly CommandStackEntry[];
  codeLine: string;
}

export interface DiLevelStepFrame {
  id: string;
  levelNumber: number;
  title: string;
  description: string;
  couplingBadge: string;
  testabilityBadge: string;
  isTestable: boolean;
  callerLabel: string;
  interfaceLabel: string | null;
  concreteLabel: string;
  dependencyDirection: 'direct' | 'global' | 'hidden' | 'inverted';
  csharpSnippet: string;
}

export const CHESS_COMMAND_STEPS: readonly ChessCommandStepFrame[] = [
  {
    id: 'cmd-0',
    title: 'Estado Inicial del Tablero',
    description:
      'El invocador (GameHistory) mantiene una pila vacía Stack<ICommand>. Ninguna acción se ejecutó todavía.',
    actionTag: 'Init',
    pieces: [
      { id: 'w-king', symbol: '♔', label: 'Rey Blanco', color: 'white', row: 4, col: 4 },
      { id: 'w-pawn', symbol: '♙', label: 'Peón Blanco', color: 'white', row: 3, col: 2 },
      { id: 'b-knight', symbol: '♞', label: 'Caballo Negro', color: 'black', row: 0, col: 1 },
      { id: 'b-king', symbol: '♚', label: 'Rey Negro', color: 'black', row: 0, col: 4 },
    ],
    highlightedSquares: [],
    commandStack: [],
    codeLine: 'var history = new Stack<ICommand>();',
  },
  {
    id: 'cmd-1',
    title: '1. MoveCommand.Execute() — Avance Simple',
    description:
      'Se crea MoveCommand(c2 → c3) y se llama Execute(). El comando guarda origen y destino y se apila en el historial.',
    actionTag: 'Execute()',
    pieces: [
      { id: 'w-king', symbol: '♔', label: 'Rey Blanco', color: 'white', row: 4, col: 4 },
      { id: 'w-pawn', symbol: '♙', label: 'Peón Blanco', color: 'white', row: 2, col: 2 },
      { id: 'b-knight', symbol: '♞', label: 'Caballo Negro', color: 'black', row: 0, col: 1 },
      { id: 'b-king', symbol: '♚', label: 'Rey Negro', color: 'black', row: 0, col: 4 },
    ],
    highlightedSquares: ['3-2', '2-2'],
    commandStack: [{ id: 'c1', signature: 'MoveCommand(c2 → c3)' }],
    codeLine: 'cmd1.Execute(); history.Push(cmd1);',
  },
  {
    id: 'cmd-2',
    title: '2. MoveCommand.Execute() — Captura con Snapshot',
    description:
      'El caballo negro captura al peón blanco en c3. Antes de sobreescribir la casilla, MoveCommand guarda _captured = ♙ dentro de su propio estado.',
    actionTag: 'Execute() + Captura',
    pieces: [
      { id: 'w-king', symbol: '♔', label: 'Rey Blanco', color: 'white', row: 4, col: 4 },
      { id: 'b-knight', symbol: '♞', label: 'Caballo Negro', color: 'black', row: 2, col: 2 },
      { id: 'b-king', symbol: '♚', label: 'Rey Negro', color: 'black', row: 0, col: 4 },
    ],
    highlightedSquares: ['0-1', '2-2'],
    commandStack: [
      { id: 'c1', signature: 'MoveCommand(c2 → c3)' },
      { id: 'c2', signature: 'MoveCommand(b5 → c3)', capturedLabel: '_captured: ♙' },
    ],
    codeLine: '_captured = board.PieceAt(to); board.MovePiece(from, to);',
  },
  {
    id: 'cmd-3',
    title: '3. MoveCommand.Undo() — Restauración de Captura',
    description:
      'Al desapilar el último comando y llamar Undo(), el caballo vuelve a b5 y la pieza capturada (♙) se restaura exactamente en c3.',
    actionTag: 'Undo() + Restore',
    pieces: [
      { id: 'w-king', symbol: '♔', label: 'Rey Blanco', color: 'white', row: 4, col: 4 },
      { id: 'w-pawn', symbol: '♙', label: 'Peón Blanco', color: 'white', row: 2, col: 2 },
      { id: 'b-knight', symbol: '♞', label: 'Caballo Negro', color: 'black', row: 0, col: 1 },
      { id: 'b-king', symbol: '♚', label: 'Rey Negro', color: 'black', row: 0, col: 4 },
    ],
    highlightedSquares: ['2-2', '0-1'],
    commandStack: [{ id: 'c1', signature: 'MoveCommand(c2 → c3)' }],
    codeLine: 'board.MovePiece(to, from); board.PlacePiece(_captured, to);',
  },
  {
    id: 'cmd-4',
    title: '4. MoveCommand.Undo() — Retorno al Inicio',
    description:
      'Deshacer el primer comando devuelve el peón blanco a c2 y deja la pila vacía. Todo el historial es reversible sin acoplar la UI.',
    actionTag: 'Undo()',
    pieces: [
      { id: 'w-king', symbol: '♔', label: 'Rey Blanco', color: 'white', row: 4, col: 4 },
      { id: 'w-pawn', symbol: '♙', label: 'Peón Blanco', color: 'white', row: 3, col: 2 },
      { id: 'b-knight', symbol: '♞', label: 'Caballo Negro', color: 'black', row: 0, col: 1 },
      { id: 'b-king', symbol: '♚', label: 'Rey Negro', color: 'black', row: 0, col: 4 },
    ],
    highlightedSquares: ['2-2', '3-2'],
    commandStack: [],
    codeLine: 'history.Pop().Undo();',
  },
];

export const DI_LEVEL_STEPS: readonly DiLevelStepFrame[] = [
  {
    id: 'di-1',
    levelNumber: 1,
    title: 'Nivel 1: Referencia Directa (new)',
    description:
      'ChessEngine instancia su propia dependencia concreta adentro de la clase. No se puede reemplazar por un doble en tests.',
    couplingBadge: 'Acoplamiento Fuerte',
    testabilityBadge: 'No testeable aislado',
    isTestable: false,
    callerLabel: 'ChessEngine',
    interfaceLabel: null,
    concreteLabel: 'SqlMatchRepository',
    dependencyDirection: 'direct',
    csharpSnippet:
      'public class ChessEngine {\n  private readonly SqlMatchRepository _repo = new SqlMatchRepository();\n}',
  },
  {
    id: 'di-2',
    levelNumber: 2,
    title: 'Nivel 2: Singleton Global',
    description:
      'Se evita el new local usando una instancia global única, pero ChessEngine sigue acoplado al nombre concreto y comparte estado entre tests.',
    couplingBadge: 'Estado Global Compartido',
    testabilityBadge: 'Tests frágiles / acoplados',
    isTestable: false,
    callerLabel: 'ChessEngine',
    interfaceLabel: null,
    concreteLabel: 'SqlMatchRepository.Instance',
    dependencyDirection: 'global',
    csharpSnippet:
      'public void Save() {\n  SqlMatchRepository.Instance.Persist(_board);\n}',
  },
  {
    id: 'di-3',
    levelNumber: 3,
    title: 'Nivel 3: Service Locator',
    description:
      'Se introduce la interfaz IMatchRepository, pero la clase la pide a un registro estático oculto. Su constructor miente sobre lo que necesita.',
    couplingBadge: 'Dependencia Oculta',
    testabilityBadge: 'Requiere configurar registro global',
    isTestable: false,
    callerLabel: 'ChessEngine',
    interfaceLabel: 'ServiceLocator.Get<IMatchRepository>()',
    concreteLabel: 'SqlMatchRepository',
    dependencyDirection: 'hidden',
    csharpSnippet:
      'public void Save() {\n  var repo = ServiceLocator.Get<IMatchRepository>();\n  repo.Persist(_board);\n}',
  },
  {
    id: 'di-4',
    levelNumber: 4,
    title: 'Nivel 4: Inyección de Dependencias (Constructor)',
    description:
      'ChessEngine declara explícitamente IMatchRepository en su constructor. Producción inyecta SQL; los tests inyectan FakeMatchRepo en memoria.',
    couplingBadge: 'Bajo Acoplamiento (DIP)',
    testabilityBadge: '100% Testeable con Stub/Fake',
    isTestable: true,
    callerLabel: 'ChessEngine',
    interfaceLabel: 'IMatchRepository',
    concreteLabel: 'SqlMatchRepo / FakeMatchRepo',
    dependencyDirection: 'inverted',
    csharpSnippet:
      'public class ChessEngine {\n  private readonly IMatchRepository _repo;\n  public ChessEngine(IMatchRepository repo) => _repo = repo;\n}',
  },
];

export const BOARD_COLUMN_LABELS = ['a', 'b', 'c', 'd', 'e'] as const;
export const BOARD_ROW_LABELS = ['5', '4', '3', '2', '1'] as const;
