'use client';

import React, { useState, useEffect } from 'react';
import { Comment } from '@/types';
import { MessageSquare, Heart, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, increment } from 'firebase/firestore';

interface CommentsSectionProps {
  lessonId: string;
}

export default function CommentsSection({ lessonId }: CommentsSectionProps) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [likedComments, setLikedComments] = useState<string[]>([]);
  const [submittedMessage, setSubmittedMessage] = useState(false);

  // Load comments for this specific lesson from localStorage & Firestore (0 fake comments)
  useEffect(() => {
    const storageKey = `alhadaf_comments_${lessonId}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setComments(JSON.parse(saved));
      }
    } catch {}

    // Load from Firestore if configured
    if (db) {
      getDocs(query(collection(db, 'comments'), where('lessonId', '==', lessonId)))
        .then((snapshot) => {
          if (!snapshot.empty) {
            const list: Comment[] = [];
            snapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as Comment));
            setComments(list);
            try {
              localStorage.setItem(storageKey, JSON.stringify(list));
            } catch {}
          }
        })
        .catch(() => {});
    }
  }, [lessonId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const authorName = profile?.displayName || guestName.trim() || 'طالب متميز';
    const authorAvatar = profile?.photoURL;

    const commentObj: Comment = {
      id: `comm_${Date.now()}`,
      lessonId,
      userId: profile?.uid || `guest_${Date.now()}`,
      userName: authorName,
      userAvatar: authorAvatar,
      content: newComment.trim(),
      createdAt: 'الآن',
      likes: 0,
      isApproved: true,
    };

    const updated = [commentObj, ...comments];
    setComments(updated);
    try {
      localStorage.setItem(`alhadaf_comments_${lessonId}`, JSON.stringify(updated));
    } catch {}

    if (db) {
      try {
        await addDoc(collection(db, 'comments'), commentObj);
      } catch {}
    }

    setNewComment('');
    setSubmittedMessage(true);
    setTimeout(() => setSubmittedMessage(false), 4000);
  };

  const handleLike = async (commentId: string) => {
    if (likedComments.includes(commentId)) return;
    setLikedComments([...likedComments, commentId]);
    const updated = comments.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c);
    setComments(updated);
    try {
      localStorage.setItem(`alhadaf_comments_${lessonId}`, JSON.stringify(updated));
    } catch {}
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary-600 dark:text-gold-400" />
          <span>الأسئلة والتعليقات ({comments.length})</span>
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          شارك بسؤالك أو استفسارك التعليمي حول الدرس
        </span>
      </div>

      {/* New Comment Input Form */}
      <form onSubmit={handleAddComment} className="mb-8">
        {!user && (
          <div className="mb-3">
            <input
              type="text"
              placeholder="اسمك الكريم (اختياري)..."
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full sm:w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:border-primary-500 focus:outline-none"
            />
          </div>
        )}

        <div className="relative">
          <textarea
            rows={3}
            placeholder="اكتب تعليقك أو سؤالك حول هذا الدرس وسيجيبك المشرف..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 p-4 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="absolute left-3 bottom-3.5 flex items-center gap-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white px-4 py-1.5 text-xs font-bold shadow transition-all"
          >
            <span>إرسال</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>

        {submittedMessage && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-fade-in">
            <CheckCircle2 className="h-4 w-4" />
            <span>تمت إضافة تعليقك بنجاح!</span>
          </div>
        )}
      </form>

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isLiked = likedComments.includes(comment.id);

            return (
              <div
                key={comment.id}
                className="flex gap-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 p-4 border border-slate-100 dark:border-slate-800/80 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 text-white font-bold text-sm shadow-sm">
                  {comment.userName.charAt(0)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {comment.userName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {comment.createdAt}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {comment.content}
                  </p>

                  <div className="mt-2.5 flex items-center gap-4">
                    <button
                      onClick={() => handleLike(comment.id)}
                      className={`flex items-center gap-1 text-xs transition-colors ${
                        isLiked
                          ? 'text-rose-500 font-bold'
                          : 'text-slate-400 hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{comment.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-xs text-slate-400">
            كن أول من يطرح سؤالاً أو تعليقاً حول هذا الدرس.
          </p>
        </div>
      )}
    </div>
  );
}
