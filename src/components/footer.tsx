import classNames from 'classnames';
import { Todo } from '../types/Todo';

type Props = {
  todoList: Todo[];
  selectedFilter: string;
  filterTodos: (str: string) => void;
  handleDeleteCompletedTodo: () => void;
};

export const Footer: React.FC<Props> = ({
  todoList,
  selectedFilter,
  filterTodos,
  handleDeleteCompletedTodo,
}) => {
  return (
    <footer className="todoapp__footer" data-cy="Footer">
      <span className="todo-count" data-cy="TodosCounter">
        {todoList.filter(todo => !todo.completed).length} items left
      </span>

      {/* Active link should have the 'selected' class */}
      <nav className="filter" data-cy="Filter">
        <a
          href="#/"
          className={classNames('filter__link', {
            selected: selectedFilter === 'all',
          })}
          data-cy="FilterLinkAll"
          onClick={() => filterTodos('all')}
        >
          All
        </a>

        <a
          href="#/active"
          className={classNames('filter__link', {
            selected: selectedFilter === 'active',
          })}
          data-cy="FilterLinkActive"
          onClick={() => filterTodos('active')}
        >
          Active
        </a>

        <a
          href="#/completed"
          className={classNames('filter__link', {
            selected: selectedFilter === 'completed',
          })}
          data-cy="FilterLinkCompleted"
          onClick={() => filterTodos('completed')}
        >
          Completed
        </a>
      </nav>

      {/* this button should be disabled if there are no completed todos */}
      <button
        type="button"
        className="todoapp__clear-completed"
        data-cy="ClearCompletedButton"
        disabled={todoList.filter(todo => todo.completed).length < 1}
        onClick={handleDeleteCompletedTodo}
      >
        Clear completed
      </button>
    </footer>
  );
};
