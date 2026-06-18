"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  ReactFlow,
  MiniMap,
  MarkerType,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const initialNodes: Node[] = [
  {
    id: "start",
    type: "custom",
    position: { x: 80, y: 140 },
    data: { title: "Start", summary: "触发流程的入口", color: "#22c55e" },
  },
  {
    id: "review",
    type: "custom",
    position: { x: 360, y: 80 },
    data: {
      title: "Review",
      summary: "审批节点，支持多人处理",
      color: "#7c3aed",
    },
  },
  {
    id: "deploy",
    type: "custom",
    position: { x: 360, y: 260 },
    data: { title: "Deploy", summary: "自动部署到生产环境", color: "#06b6d4" },
  },
  {
    id: "done",
    type: "custom",
    position: { x: 650, y: 170 },
    data: { title: "Done", summary: "流程完成并记录日志", color: "#f97316" },
  },
];

const initialEdges: Edge[] = [
  {
    id: "e-start-review",
    source: "start",
    target: "review",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e-review-deploy",
    source: "review",
    target: "deploy",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e-deploy-done",
    source: "deploy",
    target: "done",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
];

type CardData = { title: string; summary: string; color: string };

function WorkflowNode({ data }: { data: CardData }) {
  return (
    <div
      className="node-card"
      style={{ ["--node-color" as string]: data.color }}
    >
      <Handle type="target" position={Position.Left} className="node-handle" />
      <div className="node-badge" />
      <div className="node-title">{data.title}</div>
      <div className="node-summary">{data.summary}</div>
      <Handle type="source" position={Position.Right} className="node-handle" />
    </div>
  );
}

export default function Page() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const nodeTypes = useMemo(() => ({ custom: WorkflowNode }), []);

  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((current) => applyNodeChanges(changes, current));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((current) => applyEdgeChanges(changes, current));
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((current) =>
      addEdge(
        {
          ...connection,
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { strokeWidth: 2.5 },
        },
        current,
      ),
    );
  }, []);

  const addNode = () => {
    const id = `step-${nodes.length + 1}`;
    setNodes((current) => [
      ...current,
      {
        id,
        type: "custom",
        position: { x: 140 + current.length * 38, y: 420 },
        data: {
          title: `Step ${current.length + 1}`,
          summary: "点击右侧卡片可编辑内容",
          color: "#38bdf8",
        },
      },
    ]);
  };

  const updateSelectedNode = (field: "title" | "summary", value: string) => {
    if (!selectedNode) return;
    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNode.id
          ? { ...node, data: { ...node.data, [field]: value } }
          : node,
      ),
    );
  };

  const resetGraph = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSelectedNodeId(null);
  };

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">React Flow Workflow Studio</p>
          <h1>可拖拽、可连线、可编辑的流程编排小项目</h1>
          <p className="lead">
            适合做审批流、自动化任务流、数据处理管道的可视化原型。
          </p>
        </div>
        <div className="hero-actions">
          <button className="primary" onClick={addNode}>
            新增节点
          </button>
          <button className="secondary" onClick={resetGraph}>
            重置画布
          </button>
        </div>
      </section>

      <section className="workspace">
        <div className="canvas-panel">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            fitView
            className="flow-canvas"
          >
            <MiniMap zoomable pannable nodeStrokeWidth={3} />
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
          </ReactFlow>
        </div>

        <aside className="side-panel">
          <div className="panel-card">
            <h2>节点详情</h2>
            {selectedNode ? (
              <>
                <label>
                  标题
                  <input
                    value={selectedNode.data.title}
                    onChange={(e) =>
                      updateSelectedNode("title", e.target.value)
                    }
                  />
                </label>
                <label>
                  描述
                  <textarea
                    rows={5}
                    value={selectedNode.data.summary}
                    onChange={(e) =>
                      updateSelectedNode("summary", e.target.value)
                    }
                  />
                </label>
                <div className="meta-row">
                  <span>ID</span>
                  <strong>{selectedNode.id}</strong>
                </div>
              </>
            ) : (
              <p className="placeholder">点击画布中的任意节点开始编辑。</p>
            )}
          </div>

          <div className="panel-card muted">
            <h3>使用说明</h3>
            <ul>
              <li>拖拽节点调整流程位置</li>
              <li>从节点右侧连接点拖到其他节点建立连线</li>
              <li>支持缩放、平移和小地图导航</li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}
