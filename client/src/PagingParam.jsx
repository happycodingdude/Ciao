import { useState } from 'react';

const usePagingParam = () => {
  const [searchs, setSearch] = useState([]);
  const [includes, setInclude] = useState([]);
  const [sorts, setSort] = useState([]);
  const [param, setParam] = useState({});

  const addSearch = (item) => {
    setSearch(prev => [...prev, item]);
  };

  const addInclude = (item) => {
    setInclude(prev => [...prev, item]);
  };

  const addSort = (item) => {
    setSort(prev => [...prev, item]);
  };

  const build = () => {
    console.log(includes);
    // setParam({
    //   ...param,
    //   Searchs: searchs,
    //   Includes: includes,
    //   Sorts: sorts
    // })
  }

  return {
    addSearch,
    addInclude,
    addSort,
    build,
    param
  };
}

export default usePagingParam;