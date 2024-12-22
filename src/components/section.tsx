import classNames from 'classnames';
import { Todo } from '../types/Todo';

type Props = {
  filteredTodoList: Todo[];
  deletingTodos: number[];
  handleToggleCompletion: (numb: number) => void;
  handleDeleteTodo: (numb: number) => void;
  tempTodo?: Todo | null;
};

export const MainSection: React.FC<Props> = ({
  filteredTodoList,
  deletingTodos,
  handleToggleCompletion,
  handleDeleteTodo,
  tempTodo,
}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {filteredTodoList.map(todo => (
        <div
          data-cy="Todo"
          className={classNames('todo', {
            completed: todo.completed,
            'todo--loading': deletingTodos.includes(todo.id),
          })}
          key={todo.id}
        >
          {/* eslint-disable-next-line */}
          <label
            className="todo__status-label"
            htmlFor={`todo-status-${todo.id}`}
          >
            <input
              data-cy="TodoStatus"
              type="checkbox"
              className="todo__status"
              checked={todo.completed}
              id={`todo-status-${todo.id}`}
              onChange={() => handleToggleCompletion(todo.id)}
              disabled={deletingTodos.includes(todo.id)}
            />
          </label>

          <span data-cy="TodoTitle" className="todo__title">
            {todo.title}
          </span>
          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => handleDeleteTodo(todo.id)}
            disabled={deletingTodos.includes(todo.id)}
          >
            ×
          </button>

          {deletingTodos.includes(todo.id) && (
            <div data-cy="TodoLoader" className="modal overlay is-active">
              <div className="modal-background has-background-white-ter" />
              <div className="loader" />
            </div>
          )}
        </div>
      ))}

      {tempTodo && (
        <div
          data-cy="Todo"
          className={classNames('todo', 'todo--loading')}
          key="tempTodo"
        >
          {/* eslint-disable-next-line */}
          <label className="todo__status-label" htmlFor="tempTodo">
            <input
              data-cy="TodoStatus"
              type="checkbox"
              className="todo__status"
              disabled
              id="tempTodo"
            />
          </label>

          <span data-cy="TodoTitle" className="todo__title">
            {tempTodo.title}
          </span>
          <button type="button" className="todo__remove" disabled>
            ×
          </button>

          <div data-cy="TodoLoader" className="modal overlay is-active">
            <div className="modal-background has-background-white-ter" />
            <div className="loader" />
          </div>
        </div>
      )}
    </section>
  );
};
