import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  ListTodo,
  Tag
} from 'lucide-react';
import { DailyTask } from '../types/index.ts';

interface DailyTasksViewProps {
  tasks: DailyTask[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Omit<DailyTask, 'id' | 'isCompleted'>) => void;
  onDeleteTask: (taskId: string) => void;
}

export const DailyTasksView: React.FC<DailyTasksViewProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('CS601');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newDueDate, setNewDueDate] = useState('Today');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask({
      studentId: 'usr-student-1',
      title: newTitle.trim(),
      subjectCode: newSubject,
      priority: newPriority,
      dueDate: newDueDate
    });
    setNewTitle('');
  };

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter(t => {
    if (filter === 'completed') return t.isCompleted;
    if (filter === 'pending') return !t.isCompleted;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Progress Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-blue-600" />
            <span>Daily Tasks & Academic ToDo Tracker</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Organize daily revision, assignments, and lab prep. Completed tasks feed into your study habit score.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="text-right">
            <div className="text-xs text-slate-500">Progress Today</div>
            <div className="text-lg font-black font-mono text-blue-600 dark:text-blue-400">
              {completedCount} / {tasks.length} Completed ({progressPercent}%)
            </div>
          </div>
          <div className="w-24 sm:w-32 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
        </div>
      </div>

      {/* New Task Creation Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Add New Academic Task</div>
          
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-6">
              <input
                type="text"
                placeholder="What do you plan to study or finish today?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CS601">CS601 (ML)</option>
                <option value="CS602">CS602 (Cloud)</option>
                <option value="CS603">CS603 (Arch)</option>
                <option value="CS604">CS604 (Compiler)</option>
                <option value="CS605">CS605 (Security)</option>
                <option value="General">General / Project</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Task Filters & Task List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            {(['all', 'pending', 'completed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  filter === tab
                    ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 font-mono">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} listed
          </span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No tasks in this view</div>
            <p className="text-xs text-slate-500">You are all caught up or no tasks match this filter!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredTasks.map(task => (
              <div 
                key={task.id}
                className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/50 dark:hover:bg-slate-800/40 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    aria-label={`Mark task ${task.title} as ${task.isCompleted ? 'incomplete' : 'complete'}`}
                    className="text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {task.isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 hover:text-blue-600" />
                    )}
                  </button>

                  <div className="space-y-0.5">
                    <span className={`text-xs font-semibold ${task.isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                      {task.title}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                        {task.subjectCode}
                      </span>
                      <span>·</span>
                      <span className={`font-semibold ${
                        task.priority === 'high' ? 'text-rose-500' : task.priority === 'medium' ? 'text-amber-500' : 'text-slate-400'
                      }`}>
                        {task.priority.toUpperCase()} Priority
                      </span>
                      <span>·</span>
                      <span>Due {task.dueDate}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteTask(task.id)}
                  aria-label="Delete task"
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
