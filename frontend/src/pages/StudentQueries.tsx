import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { MessageCircle, Send } from "lucide-react";

interface Reply {
  from: string;
  message: string;
  timestamp: string;
}

interface Query {
  _id: string;
  studentName: string;
  facultyName: string;
  course: string;
  queryText: string;
  replyText?: string;
  urgent: boolean;
  status: string;
  createdAt: string;
  replies: Reply[];
}

const StudentQueries = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [reply, setReply] = useState<string>("");
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Fetch queries for the logged-in faculty
  useEffect(() => {
    if (!user?.id) return;
    api
      .get<Query[]>(`/queries/faculty/${user.id}`)
      .then((res) => setQueries(res.data))
      .catch((err) => console.error(err));
  }, [user?.id]);

  const handleReply = async (id: string) => {
    if (!reply.trim()) return alert("Type a reply first");
    try {
      await api.put(`/queries/${id}/reply`, {
        replyText: reply,
        from: user.name,
      });
      setReply("");
      setSelectedQuery(null);
      const res = await api.get<Query[]>(
        `/queries/faculty/${user.id}`
      );
      setQueries(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      className="space-y-6 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
        <MessageCircle className="w-6 h-6" /> Student Queries
      </h1>

      {queries.length === 0 ? (
        <p className="text-muted-foreground">No queries found.</p>
      ) : (
        <div className="space-y-4">
          {queries.map((q, index) => (
            <motion.div
              key={q._id}
              className="p-4 border rounded-lg shadow-sm bg-background hover:bg-accent/50 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{q.studentName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {q.course} • {new Date(q.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Badge
                    variant={
                      q.status === "resolved"
                        ? "default"
                        : q.status === "in_progress"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {q.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <p className="mt-3 text-sm">{q.queryText}</p>

              {q.replies.length > 0 && (
                <div className="mt-3 space-y-2">
                  {q.replies.map((r, i) => (
                    <div key={i} className="bg-muted p-2 rounded-md text-sm">
                      <strong>{r.from}:</strong> {r.message}
                      <div className="text-xs text-muted-foreground">
                        {new Date(r.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {q.status !== "resolved" && (
                <div className="flex mt-3 gap-2">
                  {selectedQuery === q._id ? (
                    <>
                      <Textarea
                        rows={2}
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Type your reply..."
                      />
                      <Button onClick={() => handleReply(q._id)}>
                        <Send className="w-4 h-4 mr-2" /> Send
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setSelectedQuery(q._id)}
                    >
                      Reply
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default StudentQueries;
