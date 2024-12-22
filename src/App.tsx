/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useCallback, useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import { deleteTodo, getTodos, postTodo, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import { sendErrorMessage } from './utils/sendError';
import { useRef } from 'react';
import { Footer } from './components/footer';
import { ErrorMessage } from './components/errorsUnderFooter';
import { MainSection } from './components/section';
import { Header } from './components/header';

export const App: React.FC = () => {
  const [todoList, setTodoList] = useState<Todo[]>([]);
  const [filteredTodoList, setFilteredTodoList] = useState<Todo[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [title, setTitle] = useState('');
  const [loader, setLoader] = useState(false);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [deletingTodos, setDeletingTodos] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

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

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [tempTodo, deletingTodos]);

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
      title: title.trim(),
      completed: false,
    })
      .then(data => {
        setTodoList(preTodoList => [...preTodoList, data]);
        setTempTodo(null);
        setTitle('');
      })
      .catch(() => {
        setTempTodo(null);
        sendErrorMessage('Unable to add a todo', setErrorMessage);
      })
      .finally(() => {
        setLoader(false);
      });
  }

  async function handleDeleteTodo(todoId: number) {
    setDeletingTodos(prev => [...prev, todoId]);

    try {
      await deleteTodo(todoId);
      setTodoList(prevTodoList =>
        prevTodoList.filter(todo => todo.id !== todoId),
      );
    } catch {
      sendErrorMessage('Unable to delete a todo', setErrorMessage);
    } finally {
      setDeletingTodos(prev => prev.filter(id => id !== todoId));
    }
  }

  async function handleDeleteCompletedTodo() {
    const completedTodoIds = todoList
      .filter(todo => todo.completed)
      .map(todo => todo.id);

    setDeletingTodos(prev => [...prev, ...completedTodoIds]);

    let hasError = false;

    for (const id of completedTodoIds) {
      try {
        await deleteTodo(id);
        setTodoList(prev => prev.filter(todo => todo.id !== id));
      } catch {
        hasError = true;
      }
    }

    setDeletingTodos(prev => prev.filter(id => !completedTodoIds.includes(id)));

    if (hasError) {
      sendErrorMessage('Unable to delete a todo', setErrorMessage);
    }
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          filteredTodoList={filteredTodoList}
          submitTodo={submitTodo}
          inputRef={inputRef}
          title={title}
          handleChangeInput={handleChangeInput}
          loader={loader}
        />

        <MainSection
          filteredTodoList={filteredTodoList}
          deletingTodos={deletingTodos}
          handleToggleCompletion={handleToggleCompletion}
          handleDeleteTodo={handleDeleteTodo}
          tempTodo={tempTodo}
        />

        {todoList.length > 0 && (
          <Footer
            todoList={todoList}
            selectedFilter={selectedFilter}
            filterTodos={filterTodos}
            handleDeleteCompletedTodo={handleDeleteCompletedTodo}
          />
        )}
      </div>

      <ErrorMessage
        message={errorMessage}
        clearMessage={() => setErrorMessage('')}
      />
    </div>
  );
};
