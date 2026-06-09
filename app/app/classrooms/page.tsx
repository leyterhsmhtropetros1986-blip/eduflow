"use client";

export default function ClassroomsPage() {
  return (
    <div style={{ padding: "30px" }}>
      <h1>🏫 Αίθουσες</h1>

      <table>
        <thead>
          <tr>
            <th>Αίθουσα</th>
            <th>Χωρητικότητα</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Α1</td>
            <td>20</td>
          </tr>

          <tr>
            <td>Α2</td>
            <td>15</td>
          </tr>

          <tr>
            <td>Β1</td>
            <td>25</td>
          </tr>

          <tr>
            <td>Πληροφορικής</td>
            <td>18</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}