import React, { useState, useEffect } from 'react';
import './Fruits.css';

function Fruits() {
  // data変数の宣言
  const [data, setData] = useState();

  // webページが読み込まれた後に処理を開始する
  useEffect(() => {
    console.log("call useEffect START");
    fetch('http://localhost:8080/fruits').then(response => {
      response.json().then(value => {
        console.log(value);
        // dataをdata変数にセットする
        setData(value);
      })
    })
      // エラーをキャッチしたときの処理
      .catch(error => {
        console.log(error);
        setData([]);
      });

    console.log("call useEffect END");
    return () => { };
  }, []);


  // フルーツデータを再取得する関数 -> 追加・削除処理共通なので外に置いとく
  const fetchFruitData = () => {
    fetch('http://localhost:8080/fruits')
      .then(response => response.json())
      .then(data => {
        setData(data);
      })
      .catch(error => {
        console.error('Error fetching fruit data:', error);
        setData([]);
      });
  }

  // ----------------------------追加処理---------------------------------

  // フォームから送信された際の処理
  // 送信ボタンが押された時に行われる処理、eventに詰める
  const handleSubmit = (event) => {
    // 本来のform送信の処理をキャンセルする
    event.preventDefault();
    // event.target、つまりフォームの内容をオブジェクトに変換する
    // FormDataオブジェクトはkeyが名前、valueが値のオブジェクト
    // 例、名前=key、恭兵=valueという形式でオブジェクトになってる
    const formData = new FormData(event.target);

    // formDataをjs形式にまとめる
    const newStock = {
      name: formData.get('name'),
      price: parseInt(formData.get('price')),
      stock: parseInt(formData.get('stock'))
    };

    // 追加処理の関数を呼び出して、追加処理を行う！
    addStock(newStock);
  }

  // 在庫情報を追加する関数
  const addStock = (formData) => {
    fetch('http://localhost:8080/fruits/add', {
      // 通信形式の設定
      method: 'POST',
      // ここを書かないとエラーになる
      headers: {
        'Content-Type': 'application/json'
      },
      // json形式にフォームのデータを変換している
      body: JSON.stringify(formData)
    })
      // こいつらをresponse関数に詰める
      .then(response => {
        // resoponseのtrue判定?がtrueだったら、フルーツデータを再取得して更新
        if (response.ok) {
          return fetchFruitData();
        } else {
          // 更新失敗時のメッセージ
          // エラーメッセージを表示するなどの処理を行う
          console.error('Failed to add stock');
        }
      })
      // 更新以外のエラーはここ
      .catch(error => {
        console.error('Error adding stock:', error);
      });
  }

  // -------------------------ここまで---------------------------




  // ----------------------------削除処理---------------------------------

  // 削除ボタンがクリックされたときに発動する関数
  const handleDelete = (event) => {
    // buttonタグのvalue = 各要素のidを取得する
    let id = event.target.value;

    // urlとidの組み合わせを作って情報をjson形式で取得する
    fetch('http://localhost:8080/fruits/' + id).then(response => {
      response.json().then(value => {
        console.log(value);
        // idをもとに取り出したデータをjs形式でまとめる
        const newStock = {
          // idがないと削除されないためここは必須
          id: value.id,
          name: value.name,
          price: value.price,
          stock: value.stock
        };

        // 削除処理の関数を呼び出して、削除処理を行う！
        deleteStock(newStock);
      })
    })
      // エラーが出た時の処理
      .catch(error => {
        console.log(error);
        setData([]);
      });

  }

  // 在庫情報を削除する関数
  const deleteStock = (formData) => {
    fetch('http://localhost:8080/fruits/delete', {
      // 通信形式の設定
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // データの変換
      body: JSON.stringify(formData)
    })
      .then(response => {
        // resoponseのtrue判定?がtrueだったら、フルーツデータを再取得して更新
        if (response.ok) {
          return fetchFruitData();
        } else {
          // 更新失敗時のメッセージ
          // エラーメッセージを表示するなどの処理を行う
          console.error('Failed to delete stock');
        }
      })
      // 更新以外のエラーはここ
      .catch(error => {
        console.error('Error deleting stock:', error);
      });
  }

  // -------------------------ここまで---------------------------


  // データベースの値の加工処理、map関数でテーブル形式で出力できるように加工
  const fruitData = data && data.map((item, index) => {
    return (<tr key={index}>
      <td>{item.id}</td>
      <td>{item.name}</td>
      <td>{item.price}</td>
      <td>{item.stock}</td>
      <td>
        <button type='submit' name='id' value={item.id} onClick={handleDelete}>削除</button>
      </td>
    </tr>);
  })

  // html
  return (
    <div>
      <h3>フルーツ在庫情報</h3>
      <table border="1">
        <thead>
          <tr>
            <th>商品コード</th>
            <th>商品名</th>
            <th>単価</th>
            <th>在庫数</th>
          </tr>
        </thead>
        <tbody>
          {fruitData}
        </tbody>
      </table>
      <h3>在庫情報追加</h3>
      <form onSubmit={handleSubmit}>
        <label>
          商品名:
          <input type="text" name="name" required />
        </label>
        <label>
          単価:
          <input type="number" name="price" required />
        </label>
        <label>
          在庫数:
          <input type="number" name="stock" required />
        </label>
        <button type="submit">追加</button>
      </form>
    </div>
  );
}
export default Fruits;
