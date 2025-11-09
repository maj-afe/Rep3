import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { GradientCard } from "@/components/ui/gradient-card";
import { BottomNav } from "@/components/BottomNav";
import { useJournal } from "@/hooks/use-journal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Journal = () => {
  const navigate = useNavigate();
  const { entries, createEntry, updateEntry, deleteEntry, isCreating } = useJournal();
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleCreate = () => {
    if (!newContent.trim()) return;

    createEntry(
      { title: newTitle.trim() || undefined, content: newContent.trim() },
      {
        onSuccess: () => {
          setNewTitle("");
          setNewContent("");
          setIsNewDialogOpen(false);
        },
      }
    );
  };

  const handleEdit = (entry: any) => {
    setEditId(entry.id);
    setEditTitle(entry.title || "");
    setEditContent(entry.content);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editId || !editContent.trim()) return;

    updateEntry(
      { id: editId, title: editTitle.trim() || undefined, content: editContent.trim() },
      {
        onSuccess: () => {
          setEditId(null);
          setEditTitle("");
          setEditContent("");
          setIsEditDialogOpen(false);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/home")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Journal</h1>
          </div>

          <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" className="rounded-full">
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Journal Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Title (optional)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Write your thoughts..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={8}
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsNewDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={isCreating || !newContent.trim()}>
                    Save Entry
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {entries.length === 0 ? (
          <GradientCard variant="calm" className="text-center py-12">
            <p className="text-muted-foreground">
              No journal entries yet. Start writing to reflect on your journey.
            </p>
          </GradientCard>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <GradientCard key={entry.id} variant="default">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      {entry.title && (
                        <h3 className="font-semibold text-lg">{entry.title}</h3>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={isEditDialogOpen && editId === entry.id} onOpenChange={(open) => {
                        setIsEditDialogOpen(open);
                        if (!open) {
                          setEditId(null);
                          setEditTitle("");
                          setEditContent("");
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(entry)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Entry</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <Input
                              placeholder="Title (optional)"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                            />
                            <Textarea
                              placeholder="Write your thoughts..."
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              rows={8}
                            />
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                onClick={() => setIsEditDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button onClick={handleUpdate} disabled={!editContent.trim()}>
                                Update Entry
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Entry?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete
                              your journal entry.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteEntry(entry.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <p className="text-foreground whitespace-pre-wrap">{entry.content}</p>
                </div>
              </GradientCard>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Journal;
