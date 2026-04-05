import { useEffect, useRef, useState } from 'react'
import './App.css'
import ShopList from './components/ShopList';
import ShopForm from './components/ShopForm';


function App() {

  //shops→データ本体、setShops→更新関数
  const [shops, setShops] = useState(() => {

    //localStorageから保存データの取得
    const saved = localStorage.getItem("shops");

    //savedにデータがあればJSON.parseで配列に変換、データがなければ空配列で返す
    return saved ? JSON.parse(saved) : [];
  });

  //search→入力された検索文字　setSearch→入力変更時に更新
  const [search, setSearch] = useState("");

  //タグ選択用データ本体,タグ選択用関数。[]を入れることで空の状態(空配列)にして初期化。複数タグを保持するために配列にする
  const [selectedTags, setSelectedTags] = useState([]);

  //お気に入り用データ本体,お気に入り用関数。true/falseでフィルター条件のON/OFFを管理
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  //ソートの種類。ロジックのスイッチとして動く
  const [sortType, setSortType] = useState("new");
  const [toastMessage, setToastMessage] = useState("");

  const [undoInfo, setUndoInfo] = useState(null);


  const handleTagClick = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag) // 解除
        : [...prev, tag] // 追加
    );
  };

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  //検索+タグ条件
  const filteredShops = shops.filter((shop) => {

    const matchName = shop.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchTag =
      selectedTags.length > 0
        ? selectedTags.every(tag => (shop.tags || []).includes(tag))
        : true;

    const matchFavorite = showFavoritesOnly
      ? shop.favorite
      : true;

    return matchName && matchTag && matchFavorite;
    // shop.name.toLowerCase().includes(search.toLocaleLowerCase()
  })


  const sortMap = {
    favorite: (a, b) =>
      a.favorite === b.favorite ? 0 : a.favorite ? -1 : 1,

    new: (a, b) => b.id - a.id,
    old: (a, b) => a.id - b.id,

    rating: (a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return b.favorite - a.favorite;
    },

    visited: (a, b) => b.visited - a.visited,
  }

  const sortedShops = [...filteredShops].sort(
    sortMap[sortType] || (() => 0)
  );

  // const sortedShops = [...filteredShops].sort((a, b) => {

  //   if (sortType === "favorite") {
  //     //a.favoriteとb.favoriteが同じなら並びを変えない(0を返す)
  //     //a.がお気に入りなら前に出す(-1)、そうじゃないなら後ろに(1)
  //     return a.favorite === b.favorite ? 0 : a.favorite ? -1 : 1;
  //   }

  //   if (sortType === "new") {
  //     //大きいidを前に
  //     return b.id - a.id;
  //   }
  //   if (sortType === "old") {
  //     //小さいidを前に
  //     return a.id - b.id;
  //   }

  //   if (sortType === "rating") {
  //     //ratingを数値化し、大きいratingを前に
  //     return Number(b.rating) - Number(a.rating);
  //   }

  //   if (sortType === "visited") {
  //     //booleanを数値とし、trueを前に
  //     return b.visited - a.visited;
  //   }
  //   return 0;
  // })

  const allTags = Array.from(
    new Set(
      shops.flatMap(shop => shop.tags || [])
    )
  ).sort((a, b) => a.localeCompare(b, 'ja'));

  // const tagCount = {};
  //   shops.forEach(shop => {
  //     (shop.tags || []).forEach(tag => {
  //       tagCount[tag] = (tagCount[tag] || 0) + 1;
  //     })
  //   })

  //第二引数(shops)の値が変わったときにuseEffect内の処理を実行
  useEffect(() => {

    //shopsを文字列に変換してlocalStorageに保存
    localStorage.setItem("shops", JSON.stringify(shops));
  }, [shops]);

  //モーダル
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 2000);
  }

  //お店の追加
  const addShop = (shop) => {
    setShops(prev => [...prev, shop]);
    showToast("追加しました");
  };

  //お店の削除
  const deleteShop = (id) => {
    setShops(prev => prev.filter(shop => shop.id !== id));
    showToast("削除しました");
  };

  //お店の編集
  const updateShop = (id, newData, option = {}) => {
    setShops(prev =>
      prev.map(shop =>
        shop.id === id ? { ...shop, ...newData } : shop)
    );

    if (!option.silent) {
      showToast("更新しました");
    }

    if (option.undo) {
      setUndoInfo(option.undo);
      showToast("削除しました")
    }
  };

  const getSortLabel = (type) => {
    switch (type) {
      case "favorite": return "お気に入り順";
      case "visited": return "訪問済み順";
      case "rating": return "優先度順";
      case "new": return "新しい順";
      case "old": return "古い順";
      default: return "";
    }
  };

  return (
    <>
      <div className={darkMode ? "app dark" : "app"}>
        <div className='header'>
          <h1>Stockly</h1>
          <button className='theme-toggle' onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀" : "☾"}
          </button>
        </div>

        <div className='toolbar'>
          <input
            className='search-input'
            placeholder='検索'
            value={search}
            onChange={(e) => setSearch(e.target.value)} />

          <button
            className={`filter-btn ${showFavoritesOnly ? "active" : ""}`}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}>
            {showFavoritesOnly ? "すべて" : "☆お気に入り"}
          </button>

          <select className='sort-select'
            value={sortType} onChange={(e) => setSortType(e.target.value)}>
            <option value="favorite">お気に入り</option>
            <option value="visited">訪問済み</option>
            <option value="rating">優先度</option>
            <option value="new">新しい順</option>
            <option value="old">古い順</option>
          </select>

        </div>


        <div className="tag-list">
          <span className="tag-label">タグで絞り込み:</span>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`tag-base tag-filter ${selectedTags.includes(tag) ? "active" : ""}`}
              onClick={() => handleTagClick(tag)}
            >
              #{tag}
            </button>

          ))}

          {selectedTags.length > 0 && (
            <button className="clear-btn" onClick={() => setSelectedTags([])}>
              クリア
            </button>)}
        </div>

        {/*
          <div>
            選択中:
            {selectedTags.map(tag => (
              <span key={tag} style={{ marginRight: "5px" }}>
                #{tag}
              </span>
            ))}
            <button className='unLock' onClick={() => setSelectedTags([])}>
              解除
            </button>
          </div> */}

        {toastMessage && !undoInfo && ( 
          <div className='toast'>
            {toastMessage}
          </div>
        )}
        <ShopForm addShop={addShop} />

        <div className="current-sort">
          並び順: {getSortLabel(sortType)}
        </div>
        <ShopList
          shops={sortedShops}
          allShopsCount={shops.length}
          deleteShop={deleteShop}
          updateShop={updateShop}
          onTagClick={handleTagClick}
          selectedTags={selectedTags}
          allTags={allTags}
        />
      </div>


          {undoInfo && (
            <div className='toast'>
              削除しました
            <button
              className="undo-btn"
              onClick={() => {
                if (undoInfo.type === "tag") {
                  setShops(prev =>
                    prev.map(shop =>
                      shop.id === undoInfo.shopId
                        ? { ...shop, tags: undoInfo.prevTags }
                        : shop
                    )
                  );
                }
                setUndoInfo(null);
              }}
            >
              戻る
            </button>
            </div>
          )}
    </>
  );
}

export default App
