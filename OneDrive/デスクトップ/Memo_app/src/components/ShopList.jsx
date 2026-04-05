import ShopItem from './ShopItem'
import "./ShopList.css"

function ShopList({ shops, allShopsCount, deleteShop, updateShop, onTagClick, selectedTags, allTags }) {

  return (
    <div className='shop-list'>
      {shops.length === 0 ? (
        <div className='empty-state'>

          {allShopsCount === 0 ? (
            <>
              <p className="empty-title">まだお店が登録されていません</p>
              <p className="empty-sub">上のフォームから追加してみましょう</p>
            </>
          ) : (
            <>
              <p className="empty-title">条件に一致するお店がありません</p>
              <p className="empty-sub">検索やタグを変えてみてください</p>
            </>
          )}

        </div>
      ) : (shops.map(shop => (
        <ShopItem
          key={shop.id}
          shop={shop}
          deleteShop={deleteShop}
          updateShop={updateShop}
          onTagClick={onTagClick}
          selectedTags={selectedTags}
          allTags={allTags}
        />
      )))}

    </div>
  );
}

export default ShopList
