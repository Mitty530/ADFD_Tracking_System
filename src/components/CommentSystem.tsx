import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  AtSign, 
  Lock, 
  Eye,
  Clock,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RequestComment, CommentFormData, UserMention } from '../types/withdrawalTypes';
import { commentService } from '../services/commentService';
import { timelineService } from '../services/timelineService';
import UserTagging from './UserTagging';

interface CommentSystemProps {
  requestId: string;
  comments: RequestComment[];
  onCommentAdded: () => void;
}

const CommentSystem: React.FC<CommentSystemProps> = ({
  requestId,
  comments,
  onCommentAdded
}) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUserTagging, setShowUserTagging] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle @ symbol for user tagging
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart;
    
    setCommentText(value);
    setCursorPosition(position);

    // Check if user typed @ symbol
    const lastChar = value[position - 1];
    if (lastChar === '@') {
      setShowUserTagging(true);
    } else if (showUserTagging && (lastChar === ' ' || lastChar === '\n')) {
      setShowUserTagging(false);
    }

    // Parse mentions from text
    const mentions = commentService.parseMentions(value);
    setMentionedUsers(mentions);
  };

  // Handle user selection from tagging component
  const handleUserSelect = (userMention: UserMention) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const value = commentText;
    
    // Find the @ symbol position
    let atPosition = cursorPosition - 1;
    while (atPosition >= 0 && value[atPosition] !== '@') {
      atPosition--;
    }

    if (atPosition >= 0) {
      const beforeAt = value.substring(0, atPosition);
      const afterCursor = value.substring(cursorPosition);
      const newValue = `${beforeAt}@${userMention.name} ${afterCursor}`;
      
      setCommentText(newValue);
      setShowUserTagging(false);
      
      // Add user to mentioned users if not already included
      if (!mentionedUsers.includes(userMention.id)) {
        setMentionedUsers(prev => [...prev, userMention.id]);
      }

      // Focus back to textarea
      setTimeout(() => {
        textarea.focus();
        const newPosition = beforeAt.length + userMention.name.length + 2;
        textarea.setSelectionRange(newPosition, newPosition);
      }, 0);
    }
  };

  // Submit comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim() || !user || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const commentData: CommentFormData = {
        commentText: commentText.trim(),
        mentionedUsers,
        isInternal
      };

      const newComment = commentService.addComment(requestId, user.email, commentData);
      
      if (newComment) {
        // Add timeline event
        timelineService.addCommentEvent(requestId, user.email, commentText.trim());
        
        // Reset form
        setCommentText('');
        setMentionedUsers([]);
        setIsInternal(false);
        
        // Notify parent component
        onCommentAdded();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canAddComments = user && (
    user.can_create_requests || 
    user.can_approve_reject || 
    user.can_disburse || 
    !user.view_only_access
  );

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {canAddComments && (
        <motion.div
          className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 border-2 border-blue-200 shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/10 to-blue-400/10 rounded-full translate-y-12 -translate-x-12"></div>

          <div className="relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              {/* Textarea label */}
              <motion.label
                className="block text-sm font-semibold text-gray-700 mb-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                💬 Add your comment
              </motion.label>

              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <textarea
                  ref={textareaRef}
                  value={commentText}
                  onChange={handleTextChange}
                  placeholder="Share your thoughts... Use @username to mention team members"
                  className="w-full p-5 border-2 border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl"
                  rows={4}
                  disabled={isSubmitting}
                  style={{ minHeight: '120px' }}
                />

                {/* Floating action hint */}
                <motion.div
                  className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: commentText.length > 0 ? 0 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  💡 Tip: Use @ to mention teammates
                </motion.div>
              </motion.div>
              
              {/* User Tagging Dropdown */}
              {showUserTagging && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1">
                  <UserTagging
                    onUserSelect={handleUserSelect}
                    onClose={() => setShowUserTagging(false)}
                  />
                </div>
              )}
            </div>

            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <div className="flex items-center space-x-6">
                <motion.label
                  className="flex items-center space-x-3 cursor-pointer group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="sr-only"
                      disabled={isSubmitting}
                    />
                    <div className={`w-5 h-5 rounded-lg border-2 transition-all duration-200 ${
                      isInternal
                        ? 'bg-yellow-500 border-yellow-500'
                        : 'bg-white border-gray-300 group-hover:border-yellow-400'
                    }`}>
                      {isInternal && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Lock className="w-3 h-3 text-white m-0.5" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                  <span className={`text-sm font-medium flex items-center space-x-2 transition-colors ${
                    isInternal ? 'text-yellow-700' : 'text-gray-600 group-hover:text-yellow-600'
                  }`}>
                    <Lock className="w-4 h-4" />
                    <span>Internal comment</span>
                  </span>
                </motion.label>

                {mentionedUsers.length > 0 && (
                  <motion.div
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-xl"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AtSign className="w-4 h-4" />
                    <span className="text-sm font-medium">{mentionedUsers.length} user(s) mentioned</span>
                  </motion.div>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={!commentText.trim() || isSubmitting}
                className="relative flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 text-white rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:via-green-800 hover:to-emerald-800 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                style={{ zIndex: 10, position: 'relative' }}
              >
                {/* Button glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />

                <div className="relative z-10 flex items-center space-x-3">
                  {isSubmitting ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Post Comment</span>
                    </>
                  )}
                </div>
              </motion.button>
            </motion.div>
          </form>
          </div>
        </motion.div>
      )}

      {/* Comments List */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <h3 className="text-xl font-bold flex items-center space-x-3 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span>Comments ({comments.length})</span>
          </h3>

          {comments.length > 0 && (
            <motion.div
              className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, duration: 0.3 }}
            >
              💬 {comments.filter(c => !c.isInternal).length} public • 🔒 {comments.filter(c => c.isInternal).length} internal
            </motion.div>
          )}
        </motion.div>

        {comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-500 mb-2">No comments yet</h4>
            <p className="text-gray-400">
              {canAddComments 
                ? "Be the first to add a comment to this request."
                : "Comments will appear here when team members add them."
              }
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                className={`relative bg-white rounded-3xl p-6 border-2 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden ${
                  comment.isInternal
                    ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50'
                    : 'border-gray-200 hover:border-blue-300 bg-gradient-to-br from-white to-blue-50/30'
                }`}
                initial={{ opacity: 0, y: 30, scale: 0.9, rotateX: 15 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, scale: 1.02, rotateY: 2 }}
              >
                {/* Background decoration */}
                <div className={`absolute inset-0 ${
                  comment.isInternal
                    ? 'bg-gradient-to-r from-yellow-500/5 to-amber-500/5'
                    : 'bg-gradient-to-r from-blue-500/5 to-purple-500/5'
                }`}></div>

                {/* Internal comment indicator */}
                {comment.isInternal && (
                  <motion.div
                    className="absolute top-4 right-4 flex items-center space-x-1 px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-bold"
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                  >
                    <Lock className="w-3 h-3" />
                    <span>INTERNAL</span>
                  </motion.div>
                )}

                <div className="relative z-10">
                <div className="flex items-start space-x-4">
                  <motion.div
                    className="flex-shrink-0 relative"
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ duration: 0.3, type: "spring" }}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 flex items-center justify-center text-xl shadow-xl border-3 border-white relative overflow-hidden">
                      {comment.userAvatar || <User className="w-7 h-7 text-white" />}

                      {/* Avatar glow effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>

                    {/* Online status indicator */}
                    <motion.div
                      className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                    />
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">{comment.userName}</h4>
                      {comment.isInternal && (
                        <span className="inline-flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          <Lock className="w-3 h-3" />
                          <span>Internal</span>
                        </span>
                      )}
                      <span className="text-sm text-gray-500 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(comment.createdAt)}</span>
                      </span>
                    </div>
                    
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {comment.commentText}
                    </div>

                    {comment.mentionedUsers && comment.mentionedUsers.length > 0 && (
                      <div className="mt-2 flex items-center space-x-1 text-sm text-blue-600">
                        <AtSign className="w-3 h-3" />
                        <span>{comment.mentionedUsers.length} user(s) mentioned</span>
                      </div>
                    )}
                  </div>
                </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
};

export default CommentSystem;
