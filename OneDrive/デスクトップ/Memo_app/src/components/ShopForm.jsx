import { useRef, useState } from 'react'
import "./ShopForm.css"
import { validateShop } from '../utils/validateShop';
import { useShopForm } from '../hooks/useShopForm';

function ShopForm({ addShop }) {

    // const [name, setName] = useState("");
    // const [memo, setMemo] = useState("");
    // const [tags, setTags] = useState("");
    // const [link, setLink] = useState("");
    const nameRef = useRef(null);

    const {
        formData,
        errors,
        handleChange,
        validate,
        reset
    } = useShopForm({
        name: "",
        memo: "",
        tags: "",
        link: ""
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        const tagArray = [...new Set(
            formData.tags
                .split(/[,\s　]+/)
                .map(tag => tag.trim().toLowerCase())
                .filter(tag => tag !== "")
        )]

        if (e.nativeEvent.isComposing) return;
        const errors = validate();

        if (Object.keys(errors).length > 0) {
            if (errors.name) nameRef.current?.focus();
            return;
        }

        addShop({
            id: Date.now(),
            name: formData.name.trim(),
            memo: formData.memo,
            tags: tagArray,
            link: formData.link, // ここにフォームから取得したリンクを入れる
            favorite: false,
            visited: false,
            rating: 0,
            ogp: {
                title: formData.link,       // 仮でリンク自体をタイトルに
                image: "",         // 今は空、後で取得する
                description: ""    // 後で取得する
            }
        });

        reset();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className='shop-form'>

                <input
                    ref={nameRef}
                    className={`input name ${errors.name ? "error" : ""}`}
                    placeholder="店名"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                />
                {errors.name && (
                    <div className="error-message">
                        {errors.name}
                    </div>
                )}

                <input className='input memo'
                    placeholder="メモ"
                    value={formData.memo}
                    onChange={(e) => handleChange("memo", e.target.value)}
                />

                <input className='input tags'
                    placeholder="タグ"
                    value={formData.tags}
                    onChange={(e) => handleChange("tags", e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && formData.tags) {
                            e.preventDefault();
                        }
                    }}
                />

                <input className={`input link ${errors.link ? "error" : ""}`}
                    placeholder="リンク"
                    value={formData.link}
                    onChange={(e) => handleChange("link", e.target.value)}
                />

                {errors.link && (
                    <div className='error-message'>
                        {errors.link}
                    </div>
                )}

                <button type='submit' className='add-btn'> ＋ 追加</button>
            </div>
        </form>
    );
}

export default ShopForm;
