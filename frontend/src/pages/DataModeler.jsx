import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import { db } from '../services/firebase';
import { collection, query as firestoreQuery, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Database, Plus, Play, GitMerge, Download } from 'lucide-react';
import { performJoin } from '../utils/joinUtils';
import { exportDataAsCSV } from '../utils/downloadUtils';

const initialNodes = [];
const initialEdges = [];

// Defined outside component to prevent React Flow re-render warnings
const nodeTypes = {};
const edgeTypes = {};

const DataModeler = () => {
    const { user } = useAuth();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joinedResult, setJoinedResult] = useState(null);

    useEffect(() => {
        if (user) {
            fetchDatasets();
        }
    }, [user]);

    const fetchDatasets = async () => {
        try {
            // ✅ Using renamed firestoreQuery to avoid any future conflicts
            const q = firestoreQuery(
                collection(db, 'datasets'),
                where('user_id', '==', user.uid)
            );
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDatasets(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const addDatasetToCanvas = (dataset) => {
        const newNode = {
            id: dataset.id,
            data: { label: dataset.file_name, columns: dataset.column_count, data: dataset.raw_data },
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            style: {
                background: 'var(--card)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '10px',
                width: 200
            }
        };
        setNodes((nds) => nds.concat(newNode));
    };

    const handleRunJoin = () => {
        if (edges.length === 0) {
            alert("Connect two datasets first!");
            return;
        }

        const edge = edges[0];
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);

        if (!sourceNode || !targetNode) return;

        const sourceKey = Object.keys(sourceNode.data.data[0] || {})[0];
        const targetKey = Object.keys(targetNode.data.data[0] || {})[0];

        const result = performJoin(sourceNode.data.data, targetNode.data.data, sourceKey, targetKey, 'inner');
        setJoinedResult(result);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Data Modeler</h1>
                    <p className="text-muted-foreground">Connect datasets to create relationships (Power BI Style)</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleRunJoin}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:opacity-90 transition-opacity"
                    >
                        <Play className="h-4 w-4" />
                        Run Join
                    </button>
                </div>
            </div>

            <div className="flex flex-1 gap-4 overflow-hidden">
                {/* Sidebar: Available Datasets */}
                <div className="w-64 glass-card overflow-y-auto">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Your Datasets
                    </h3>
                    {loading ? (
                        <p className="text-xs text-muted-foreground">Loading datasets...</p>
                    ) : datasets.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No datasets found. Upload one first.</p>
                    ) : (
                        <div className="space-y-2">
                            {datasets.map(ds => (
                                <button
                                    key={ds.id}
                                    onClick={() => addDatasetToCanvas(ds)}
                                    className="w-full text-left p-2 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-all flex items-center justify-between group"
                                >
                                    <span className="text-xs truncate">{ds.file_name}</span>
                                    <Plus className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main Canvas */}
                <div className="flex-1 glass-card p-0 relative border-2 border-dashed border-border/50">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        fitView
                    >
                        <Background variant="dots" gap={12} size={1} />
                        <Controls />
                        <MiniMap
                            nodeColor={(n) => n.style?.background || '#fff'}
                            maskColor="rgba(0,0,0,0.1)"
                        />
                    </ReactFlow>
                </div>
            </div>

            {joinedResult && (
                <div className="glass-card animate-in slide-in-from-bottom duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-green-500">
                            <GitMerge className="h-5 w-5" />
                            <h3 className="font-bold">Join Successful</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">{joinedResult.length} rows generated</span>
                            <button
                                onClick={() => exportDataAsCSV(joinedResult, 'joined_result.csv')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-500 text-xs font-bold rounded-lg hover:bg-green-500/20 transition-colors"
                            >
                                <Download className="h-3.5 w-3.5" />
                                Download CSV
                            </button>
                        </div>
                    </div>
                    <div className="max-h-40 overflow-auto rounded-lg border border-border">
                        <table className="w-full text-left text-xs">
                            <thead className="sticky top-0 bg-muted">
                                <tr>
                                    {Object.keys(joinedResult[0] || {}).map(k => (
                                        <th key={k} className="p-2 border-b border-border">{k}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {joinedResult.slice(0, 5).map((row, i) => (
                                    <tr key={i} className="hover:bg-muted/30">
                                        {Object.values(row).map((v, j) => (
                                            <td key={j} className="p-2 border-b border-border/50">{String(v)}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataModeler;