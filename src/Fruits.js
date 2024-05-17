import React, { useState, useEffect } from 'react';
import './Fruits.css';

function Fruits() {
  // dataには何が入る？
  // setDataの呼び出し箇所に注目（※１）
  const [data, setData] = useState(/* ここに初期値。無しだとundefinedになる */);

  // webページが読み込まれた後に処理を開始する
  useEffect(() => {
    console.log("call useEffect START");
    fetch('http://localhost:8080/fruits').then(response => {
      response.json().then(value => {
        // ※２
        console.log(value);
        setData(value);
      })
      // catchを入れることで、サーバに接続できなくなったときに画面にエラーを出す代わりにコンソールに出す
    })
      .catch(error => {
        console.log(error);
        setData([]);
      });

    console.log("call useEffect END");
    return () => { };
  }, []);

  // ----------------------------追加処理---------------------------------

  // フルーツデータを再取得する関数
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

  // フォームから送信された際の処理
  // 送信ボタンが押された時に行われる処理、eventに詰める
  const handleSubmit = (event) => {
    // こいつで本来のform送信の処理をキャンセルしている
    // つまり今回はresutfullで通信形態がjsonなので、デフォルトのform機能は使用しないため
    event.preventDefault();
    // event.target、つまりフォームの内容をオブジェクトに変換する
    // FormDataオブジェクトはkeyが名前、valueが値のオブジェクト
    // 例、名前=key、恭兵=valueという形式でオブジェクトになってる
    const formData = new FormData(event.target);

    // js形式にある程度まとめてるってことかな？？？？
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
          // 在庫情報が正常に追加された場合、フルーツデータを再取得して更新する
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

  const handleDelete = (event) => {

    event.preventDefault();

    // buttonタグのnameを取得
    console.log(event.target.name);
    // buttonタグのvalueを取得
    console.log(event.target.value);
    let id = event.target.value;

    // urlとidの組み合わせを作って情報をjson形式で取得する
    fetch('http://localhost:8080/fruits/' + id).then(response => {
      response.json().then(value => {
        console.log(value);
        // idをもとに取り出したデータをjs形式でまとめる
        const newStock = {
          name: value.name,
          price: value.price,
          stock: value.stock
        };

        // 追加処理の関数を呼び出して、追加処理を行う！
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
          // 在庫情報が正常に追加された場合、フルーツデータを再取得して更新する
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
