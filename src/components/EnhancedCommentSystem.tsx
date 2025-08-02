import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Send,
  User,
  Lock,
  AtSign,
  Clock,
  Eye,
  EyeOff,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RequestComment, UserMention } from '../types/withdrawalTypes';
import { commentService } from '../services/commentService';
import UserTagging from './UserTagging';

interface EnhancedCommentSystemProps {
  requestId: string;
  comments: RequestComment[];
  onCommentAdded: () => void;
}

const EnhancedCommentSystem: React.FC<EnhancedCommentSystemProps> = ({
  requestId,
  comments,
  onCommentAdded
}) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUserTagging, setShowUserTagging] = useState(false);
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);
  const [showInternalOnly, setShowInternalOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Filter comments based on search and internal visibility
  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.commentText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVisibility = !showInternalOnly || comment.isInternal;
    return matchesSearch && matchesVisibility;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting || !user) return;

    setIsSubmitting(true);
    try {
      await commentService.addComment(requestId, user.id, {
        commentText: commentText.trim(),
        mentionedUsers,
        isInternal
      });

      setCommentText('');
      setMentionedUsers([]);
      setIsInternal(false);
      onCommentAdded();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCommentText(text);

    // Check for @ mentions
    const lastAtIndex = text.lastIndexOf('@');
    if (lastAtIndex !== -1 && lastAtIndex === text.length - 1) {
      setShowUserTagging(true);
    } else {
      setShowUserTagging(false);
    }
  };

  const handleUserSelect = (user: UserMention) => {
    const newText = commentText.slice(0, -1) + `@${user.name} `;
    setCommentText(newText);
    setMentionedUsers(prev => [...prev, user.id]);
    setShowUserTagging(false);
    textareaRef.current?.focus();
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
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center space-x-4">
          <motion.div
            className="p-3 rounded-2xl bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 text-white shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <MessageCircle className="w-6 h-6" />
          </motion.div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-teal-800 bg-clip-text text-transparent">
              Comments & Discussion
            </h3>
            <p className="text-sm text-gray-600 font-medium">{filteredComments.length} comments</p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-3">
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </motion.div>

          <motion.button
            onClick={() => setShowInternalOnly(!showInternalOnly)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              showInternalOnly
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {showInternalOnly ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showInternalOnly ? 'Internal Only' : 'All Comments'}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Comment Form */}
      {canAddComments && (
        <motion.div
          className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl p-6 border-2 border-green-200 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Compact horizontal layout */}
            <div className="flex items-start space-x-4">
              {/* User Avatar */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg">
                  {user?.name?.charAt(0) || <User className="w-5 h-5" />}
                </div>
              </div>

              {/* Comment Input */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={commentText}
                  onChange={handleTextChange}
                  placeholder="Add your comment... Use @username to mention team members"
                  className="w-full p-4 border-2 border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 bg-white/90 backdrop-blur-sm shadow-lg transition-all duration-300"
                  rows={3}
                  disabled={isSubmitting}
                />

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

              {/* Action Panel */}
              <div className="flex-shrink-0 space-y-3">
                {/* Internal Comment Toggle */}
                <motion.label
                  className="flex items-center space-x-2 cursor-pointer group"
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
                  <span className="text-sm font-medium text-gray-700">Internal</span>
                </motion.label>

                {/* Mentioned Users */}
                {mentionedUsers.length > 0 && (
                  <motion.div
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AtSign className="w-3 h-3" />
                    <span>{mentionedUsers.length} mentioned</span>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={!commentText.trim() || isSubmitting}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ zIndex: 10, position: 'relative' }}
                >
                  {isSubmitting ? (
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {/* Comments List - Horizontal Layout */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredComments.length === 0 ? (
            <motion.div
              className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No Comments Yet</h3>
              <p className="text-gray-400">Be the first to start the discussion!</p>
            </motion.div>
          ) : (
            filteredComments.map((comment, index) => (
              <motion.div
                key={comment.id}
                className={`bg-white rounded-2xl p-6 border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  comment.isInternal 
                    ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50' 
                    : 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50'
                }`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.01, y: -2 }}
              >
                {/* Horizontal comment layout */}
                <div className="flex items-start space-x-4">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                      comment.isInternal 
                        ? 'bg-gradient-to-br from-yellow-500 to-amber-600' 
                        : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                    }`}>
                      {comment.userAvatar || comment.userName.charAt(0)}
                    </div>
                  </div>

                  {/* Comment Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-bold text-gray-900">{comment.userName}</h4>
                        {comment.isInternal && (
                          <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            <Lock className="w-3 h-3" />
                            <span>Internal</span>
                          </div>
                        )}
                        {comment.mentionedUsers && comment.mentionedUsers.length > 0 && (
                          <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            <AtSign className="w-3 h-3" />
                            <span>{comment.mentionedUsers.length} mentioned</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>

                    {/* Comment Text */}
                    <p className="text-gray-700 leading-relaxed">{comment.commentText}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Comments Summary */}
      <motion.div
        className="bg-gradient-to-br from-white via-green-50 to-emerald-50 rounded-3xl p-8 border-2 border-green-200 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        whileHover={{ scale: 1.01, y: -2 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            {/* Total Comments */}
            <motion.div
              className="text-center p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg"
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-3xl font-bold mb-1">{comments.length}</div>
              <div className="text-sm font-medium opacity-90">Total Comments</div>
            </motion.div>
            
            {/* Internal Comments */}
            <motion.div
              className="text-center p-4 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 text-white shadow-lg"
              whileHover={{ scale: 1.05, rotate: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-3xl font-bold mb-1">{comments.filter(c => c.isInternal).length}</div>
              <div className="text-sm font-medium opacity-90">Internal</div>
            </motion.div>
            
            {/* Public Comments */}
            <motion.div
              className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg"
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-3xl font-bold mb-1">{comments.filter(c => !c.isInternal).length}</div>
              <div className="text-sm font-medium opacity-90">Public</div>
            </motion.div>
          </div>
          
          {comments.length > 0 && (
            <motion.div
              className="text-right bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-green-200"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <div className="text-sm font-medium text-gray-600 mb-1">Last comment</div>
              <div className="font-bold text-gray-900">{formatDate(comments[comments.length - 1].createdAt)}</div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancedCommentSystem;
