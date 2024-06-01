import React, {createContext, useState, useEffect} from "react";
import PropTypes from "prop-types";

export const CounterContext = createContext();

export const CounterProvider = ({children}) => {
  // Загружаем данные из локального хранилища при загрузке компонента
  const initialCounters = JSON.parse(localStorage.getItem("counters")) || [];
  const [counters, setCounters] = useState(initialCounters);
  const [dependencies, setDependencies] = useState({});

  // Функция для добавления нового идентификатора счетчика
  const addCounterId = (id, dependencies) => {
    setCounters([...counters, {id, value: 0}]);
    if (dependencies) {
      setDependencies({...dependencies, [id]: dependencies});
    }
  };

  // Функция для обновления значения счетчика по его идентификатору
  const updateCounterValue = (id, value) => {
    setCounters((prevCounters) => {
      // Обновление значения счётчика
      return prevCounters.map((counter) => (counter.id === id ? {...counter, value} : counter));
    });
  };

  // Функция для сброса значений счетчиков по списку идентификаторов
  const resetCounters = (ids) => {
    // Сброс значений для счетчиков, чьи идентификаторы переданы в списке ids
    setCounters((prevCounters) =>
      prevCounters.map((counter) => (ids.includes(counter.id) ? {...counter, value: 0} : counter))
    );
  };

  // Сохраняем данные в локальное хранилище при изменении counters
  useEffect(() => {
    localStorage.setItem("counters", JSON.stringify(counters));
  }, [counters]);

  return (
    <CounterContext.Provider
      value={{counters, addCounterId, updateCounterValue, resetCounters, dependencies}}
    >
      {children}
    </CounterContext.Provider>
  );
};

CounterProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
