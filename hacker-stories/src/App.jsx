import { useState, useEffect, useRef, useReducer } from "react";

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query=";
const initialStories = [
  {
    title: "React",
    url: "https://reactjs.org/",
    author: "Jordan Walke",
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: "Redux",
    url: "https://redux.js.org/",
    author: "Dan Abramov, Andrew Clark",
    num_comments: 2,
    points: 5,
    objectID: 1,
  },
];

const getAsyncStories = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        data: { stories: initialStories },
      });
    }, 2000);
  });
};

const storiesReducer = (state, action) => {
  switch (action.type) {
    case "STORIES_FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };

    case "STORIES_FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "STORIES_FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case "REMOVE_STORY":
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.objectID !== story.objectID,
        ),
      };
    default:
      throw new Error();
  }
};

const useStorageState = (key, initialState) => {
  const [value, setValue] = useState(localStorage.getItem(key) ?? initialState);
  useEffect(() => {
    localStorage.setItem(key, value);
  }, [value]);

  return [value, setValue];
};

const App = () => {
  const [searchTerm, setSearchTerm] = useStorageState("search", "React");
  const [stories, dispatchStories] = useReducer(storiesReducer, {
    data: [],
    isLoading: true,
    isError: false,
  });
  useEffect(() => {
    if (!searchTerm) return;
    fetch(`${API_ENDPOINT}${searchTerm}`)
      .then((response) => response.json())
      .then((result) => {
        dispatchStories({
          type: "STORIES_FETCH_SUCCESS",
          payload: result.hits,
        });
      })
      .catch(() => dispatchStories({ type: "STORIES_FETCH_FAILURE" }));
  }, [searchTerm]);
  function handleSearch(e) {
    setSearchTerm(e.target.value);
  }
  function handleRemoveStory(item) {
    dispatchStories({
      type: "REMOVE_STORY",
      payload: item,
    });
  }
  const searchedStories = stories.data.filter((story) =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  return (
    <div>
      <h1>My Hacker Stories</h1>
      <InputWithLabel
        id="search"
        value={searchTerm}
        isFocused
        onInputChange={handleSearch}
      >
        <strong>Search:</strong>
      </InputWithLabel>

      <hr />
      {stories.isError && <p>Something Went Wrong</p>}
      {stories.isLoading ? (
        <p>Loading:::</p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      )}
    </div>
  );
};

const InputWithLabel = ({
  id,
  value,
  type = "text",
  isFocused,
  onInputChange,
  children,
}) => {
  const inputRef = useRef();
  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);
  return (
    <>
      <label htmlFor={id}>{children}</label>
      &nbsp;
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={onInputChange}
      />
    </>
  );
};

const List = ({ list, onRemoveItem }) => (
  <ul>
    {list.map((item) => (
      <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
    ))}
  </ul>
);

const Item = ({ item, onRemoveItem }) => {
  return (
    <li>
      <span>
        <a href={item.url}>{item.title}</a>
      </span>{" "}
      <span>{item.author}</span> <span>{item.num_comments}</span>{" "}
      <span>{item.points}</span>
      <span>
        <button
          type="button"
          onClick={() => {
            onRemoveItem(item);
          }}
        >
          Dismiss
        </button>
      </span>
    </li>
  );
};

export default App;
