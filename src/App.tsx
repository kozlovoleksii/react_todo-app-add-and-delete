/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useCallback, useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import { deleteTodo, getTodos, postTodo, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import classNames from 'classnames';
import { sendErrorMessage } from './utils/sendError';

export const App: React.FC = () => {
  const [todoList, setTodoList] = useState<Todo[]>([]);
  const [filteredTodoList, setFilteredTodoList] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [title, setTitle] = useState('');
  const [loader, setLoader] = useState(false);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);

  useEffect(() => {
    getTodos(USER_ID)
      .then(data => {
        setTodoList(data);
        setFilteredTodoList(data);
      })
      .catch(() => {
        sendErrorMessage('Unable to load todos', setErrorMessage);
      });
  }, []);

  const filterTodos = useCallback(
    (status: string): void => {
      setSelectedFilter(status);

      switch (status) {
        case 'active':
          setFilteredTodoList(todoList.filter(todo => !todo.completed));
          break;
        case 'completed':
          setFilteredTodoList(todoList.filter(todo => todo.completed));
          break;
        case 'all':
        default:
          setFilteredTodoList(todoList);
          break;
      }
    },
    [todoList],
  );

  useEffect(() => {
    filterTodos(selectedFilter);
  }, [todoList, filterTodos, selectedFilter]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  function handleToggleCompletion(todoId: number) {
    setTodoList(currentTodos =>
      currentTodos.map(todo =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }

  function handleChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
  }

  function submitTodo(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim() === '') {
      sendErrorMessage('Title should not be empty', setErrorMessage);

      return;
    }

    const newTempTodo: Todo = {
      id: 0,
      userId: USER_ID,
      title: title.trim(),
      completed: false,
    };

    setTempTodo(newTempTodo);
    setLoader(true);

    postTodo({
      userId: USER_ID,
      title: title,
      completed: false,
    })
      .then(data => {
        setTodoList(preTodoList => [...preTodoList, data]);
        setTempTodo(null);
        setTitle('');
        setLoader(false);
      })
      .catch(error => {
        sendErrorMessage('Unable to add a todo', setErrorMessage);
        throw new Error(error);
      });
  }

  async function handleDeleteTodo(todoId: number) {
    setLoader(true);
    try {
      await deleteTodo(todoId);
      setTodoList(prevTodoList =>
        [...prevTodoList].filter(todo => todo.id !== todoId),
      );
      setLoader(false);
    } catch {
      sendErrorMessage('Unable to delete a todo', setErrorMessage);
    }
  }

  async function handleDeleteCompletedTodo() {
    setLoader(true);
    const completedTodoArr = todoList.filter(todo => todo.completed);

    try {
      await Promise.all(completedTodoArr.map(todo => deleteTodo(todo.id)));
      setTodoList(prevTodoList => prevTodoList.filter(todo => !todo.completed));
      setLoader(false);
    } catch {
      sendErrorMessage('Unable to delete a todo', setErrorMessage);
    }
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className={classNames('todoapp__toggle-all', {
              active:
                filteredTodoList.length > 0 &&
                filteredTodoList.every(todo => todo.completed),
            })}
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form onSubmit={submitTodo}>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={title}
              onChange={handleChangeInput}
              autoFocus
              disabled={loader}
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {filteredTodoList.map(todo => (
            <div
              data-cy="Todo"
              className={classNames('todo', { completed: todo.completed })}
              key={todo.id}
            >
              <label className="todo__status-label">
                <input
                  data-cy="TodoStatus"
                  type="checkbox"
                  className="todo__status"
                  checked={todo.completed}
                  onChange={() => handleToggleCompletion(todo.id)}
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
              >
                ×
              </button>

              <div data-cy="TodoLoader" className="modal overlay">
                <div className="modal-background has-background-white-ter" />
                <div className="loader" />
              </div>
            </div>
          ))}
          {/* test! */}
          {false && tempTodo}
        </section>

        {/* Hide the footer if there are no todos */}

        {todoList.length > 0 && (
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
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={classNames(
          'notification is-danger is-light has-text-weight-normal',
          { hidden: !errorMessage },
        )}
      >
        <button data-cy="HideErrorButton" type="button" className="delete" />
        {/* show only one message at a time */}
        {errorMessage}
        {/* Unable to load todos */}
        {/* <br />
        Title should not be empty
        <br />
        Unable to add a todo
        <br />
        Unable to delete a todo
        <br />
        Unable to update a todo */}
      </div>
    </div>
  );
};
