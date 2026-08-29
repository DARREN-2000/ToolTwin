import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { X, Upload, FileJson, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function SchemaUploadModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [schemaText, setSchemaText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleUpload = async () => {
    try {
      setIsUploading(true);
      const parsed = JSON.parse(schemaText);
      
      // Basic validation for a tool
      if (!parsed.name || !parsed.parameters) {
        throw new Error("Schema must include 'name' and 'parameters'.");
      }

      const { error } = await supabase.from("tools").insert({
        name: parsed.name,
        description: parsed.description || "",
        parameters: parsed.parameters,
        target_entity: parsed.target_entity || "unknown",
        is_destructive: parsed.is_destructive || false,
        user_id: user?.id || 'mock-123'
      });

      if (error) throw error;
      
      toast.success("Tool schema uploaded successfully!");
      setSchemaText('');
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Invalid JSON schema");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-2xl rounded-2xl border border-border/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/30">
          <h2 className="text-xl font-heading font-bold flex items-center gap-2">
            <FileJson className="w-5 h-5 text-primary" />
            Upload Tool Schema
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-sm text-foreground/70">
            Paste your JSON tool definition here. This tells your AI agent what actions it can take.
          </p>
          <div className="bg-black/50 p-3 rounded-lg border border-border/50">
            <pre className="text-xs text-foreground/50 font-mono">
{`{
  "name": "delete_server",
  "description": "Deletes a cloud server instance",
  "target_entity": "server",
  "is_destructive": true,
  "parameters": {
    "type": "object",
    "properties": {
      "server_id": { "type": "string" }
    },
    "required": ["server_id"]
  }
}`}
            </pre>
          </div>
          
          <textarea
            value={schemaText}
            onChange={(e) => setSchemaText(e.target.value)}
            placeholder="Paste JSON schema here..."
            className="w-full h-48 bg-background border border-border rounded-xl p-4 font-mono text-sm focus:outline-none focus:border-primary/50 resize-none"
          />
        </div>
        
        <div className="p-4 border-t border-border/50 bg-muted/30 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 font-medium hover:bg-muted rounded-lg transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleUpload}
            disabled={isUploading || !schemaText.trim()}
            className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Save Tool
          </button>
        </div>
      </div>
    </div>
  );
}
