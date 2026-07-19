/* 文档数据:集合 — Table / DataGrid */
import { useState } from 'react';
import { Button, DataGrid, Table, Tag, useToast, type ColumnType, type DataGridColumn } from '@fluent-react/ui';
import type { DocDef } from '../types';

interface Row { key: string; name: string; size: number; type: string; state: 'ok' | 'warn' }

const ROWS: Row[] = [
  { key: '1', name: 'theme.css', size: 48, type: '样式', state: 'ok' },
  { key: '2', name: 'Button.tsx', size: 2, type: '组件', state: 'ok' },
  { key: '3', name: 'Table.tsx', size: 6, type: '组件', state: 'warn' },
  { key: '4', name: 'bridge.ts', size: 4, type: '桥接', state: 'ok' },
  { key: '5', name: 'mock.ts', size: 3, type: '桥接', state: 'ok' },
  { key: '6', name: 'App.tsx', size: 5, type: '入口', state: 'ok' },
];

const COLS: ColumnType<Row>[] = [
  { title: '名称', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name), width: '2fr' },
  { title: '类型', dataIndex: 'type' },
  { title: '大小 (KB)', dataIndex: 'size', align: 'right', sorter: (a, b) => a.size - b.size },
  {
    title: '状态', key: 'state',
    render: (_v, r) => <Tag color={r.state === 'ok' ? 'success' : 'caution'}>{r.state === 'ok' ? '正常' : '注意'}</Tag>,
  },
];

const table: DocDef = {
  key: 'table',
  name: 'Table',
  cn: '表格',
  description:
    'antd API 的数据表格:columns 声明列(dataIndex / render / sorter / align / width),内置分页与排序(点击表头循环 升 → 降 → 无),翻页与排序时表体淡入刷新;rowSelection 行选择(表头全选带半选态 / radio 单选 / 按行禁用)、striped 斑马纹、size="small" 紧凑密度、loading 加载遮罩、empty 自定义空态、maxHeight 控表体滚动高(表头吸顶)。行高亮与选中样式为 WinUI DataGrid 形态。',
  importCode: `import { Table, type ColumnType } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      description: '「名称」「大小」列可排序;pagination 缺省每页 10 条,数据不足一页时不渲染分页条。',
      demo: <div style={{ width: '100%' }}><Table columns={COLS} dataSource={ROWS} pagination={false} /></div>,
      code: `
import { Table, Tag, type ColumnType } from '@fluent-react/ui';

interface Row { key: string; name: string; size: number; type: string; state: 'ok' | 'warn' }

const rows: Row[] = [
  { key: '1', name: 'theme.css', size: 48, type: '样式', state: 'ok' },
  { key: '2', name: 'Button.tsx', size: 2, type: '组件', state: 'ok' },
  { key: '3', name: 'Table.tsx', size: 6, type: '组件', state: 'warn' },
  { key: '4', name: 'bridge.ts', size: 4, type: '桥接', state: 'ok' },
];

const columns: ColumnType<Row>[] = [
  // 提供 sorter 即表头可点排序(点击循环 升 → 降 → 无)
  { title: '名称', dataIndex: 'name', width: '2fr',
    sorter: (a, b) => a.name.localeCompare(b.name) },
  { title: '类型', dataIndex: 'type' },
  { title: '大小 (KB)', dataIndex: 'size', align: 'right',
    sorter: (a, b) => a.size - b.size },
  { title: '状态', key: 'state',
    render: (_v, r) => (
      <Tag color={r.state === 'ok' ? 'success' : 'caution'}>{r.state === 'ok' ? '正常' : '注意'}</Tag>
    ) },
];

export function BasicTableExample() {
  return (
    <Table columns={columns} dataSource={rows} pagination={false} />
  );
}`,
    },
    {
      title: '行选择',
      description: 'rowSelection 增加选择列:表头全选作用于当前页可选行(部分勾选呈半选横杠);getCheckboxProps 按行禁用;选中行左缘 accent 竖杠。type="radio" 为单选。',
      demo: <TableSelection />,
      code: `
import { useState } from 'react';
import { Table, type ColumnType } from '@fluent-react/ui';

interface Row { key: string; name: string; size: number; type: string }

const rows: Row[] = [
  { key: '1', name: 'theme.css', size: 48, type: '样式' },
  { key: '2', name: 'Button.tsx', size: 2, type: '组件' },
  { key: '3', name: 'Table.tsx', size: 6, type: '组件' },
  { key: '4', name: 'App.tsx', size: 5, type: '入口' },
];

const columns: ColumnType<Row>[] = [
  { title: '名称', dataIndex: 'name', width: '2fr' },
  { title: '类型', dataIndex: 'type' },
  { title: '大小 (KB)', dataIndex: 'size', align: 'right' },
];

export function TableSelectionExample() {
  // 受控选中键集;传 defaultSelectedRowKeys 则为非受控
  const [keys, setKeys] = useState<string[]>(['2']);
  return (
    <>
      <Table columns={columns} dataSource={rows} pagination={false}
             rowSelection={{
               selectedRowKeys: keys,
               onChange: (k) => setKeys(k),
               // 按行禁用:「入口」类型不可选
               getCheckboxProps: (r) => ({ disabled: r.type === '入口' }),
             }} />
      <span>已选 {keys.length} 行:{keys.join(', ') || '(无)'}</span>
    </>
  );
}`,
    },
    {
      title: '斑马纹与紧凑密度',
      demo: (
        <div style={{ width: '100%' }}>
          <Table columns={COLS} dataSource={ROWS} pagination={false} striped size="small" />
        </div>
      ),
      code: `
import { Table, type ColumnType } from '@fluent-react/ui';

interface Row { key: string; name: string; size: number; type: string }

const rows: Row[] = [
  { key: '1', name: 'theme.css', size: 48, type: '样式' },
  { key: '2', name: 'Button.tsx', size: 2, type: '组件' },
  { key: '3', name: 'Table.tsx', size: 6, type: '组件' },
  { key: '4', name: 'bridge.ts', size: 4, type: '桥接' },
  { key: '5', name: 'mock.ts', size: 3, type: '桥接' },
];

const columns: ColumnType<Row>[] = [
  { title: '名称', dataIndex: 'name', width: '2fr' },
  { title: '类型', dataIndex: 'type' },
  { title: '大小 (KB)', dataIndex: 'size', align: 'right' },
];

export function TableStripedExample() {
  return (
    // striped 斑马纹;size="small" 紧凑密度(行高 32)
    <Table columns={columns} dataSource={rows}
           striped size="small" pagination={false} />
  );
}`,
    },
    {
      title: '加载与空态',
      description: 'loading 套 Spin 遮罩(150ms 延迟防闪);empty 自定义无数据占位。',
      demo: <TableLoading />,
      code: `
import { useState } from 'react';
import { Button, Empty, Table, type ColumnType } from '@fluent-react/ui';

interface Row { key: string; name: string; size: number; type: string }

const rows: Row[] = [
  { key: '1', name: 'theme.css', size: 48, type: '样式' },
  { key: '2', name: 'Button.tsx', size: 2, type: '组件' },
  { key: '3', name: 'Table.tsx', size: 6, type: '组件' },
];

const columns: ColumnType<Row>[] = [
  { title: '名称', dataIndex: 'name', width: '2fr' },
  { title: '类型', dataIndex: 'type' },
  { title: '大小 (KB)', dataIndex: 'size', align: 'right' },
];

export function TableLoadingExample() {
  const [loading, setLoading] = useState(false);
  const load = () => { setLoading(true); setTimeout(() => setLoading(false), 1600); };
  return (
    <>
      {/* loading 套 Spin 遮罩(150ms 延迟防闪) */}
      <Table columns={columns} dataSource={rows} pagination={false} loading={loading} />
      <Button size="small" onClick={load} disabled={loading}>模拟加载</Button>
      {/* empty 自定义无数据占位 */}
      <Table columns={columns} dataSource={[]} pagination={false}
             empty={<Empty description="没有匹配的文件" />} />
    </>
  );
}`,
    },
    {
      title: '分页与行点击',
      description: 'pagination.pageSize 控制每页条数;onRow 给行挂事件(选择列内点击不会误触发)。',
      demo: <TablePaged />,
      code: `
import { Table, useToast, type ColumnType } from '@fluent-react/ui';

interface Row { key: string; name: string; size: number; type: string }

const rows: Row[] = [
  { key: '1', name: 'theme.css', size: 48, type: '样式' },
  { key: '2', name: 'Button.tsx', size: 2, type: '组件' },
  { key: '3', name: 'Table.tsx', size: 6, type: '组件' },
  { key: '4', name: 'bridge.ts', size: 4, type: '桥接' },
  { key: '5', name: 'App.tsx', size: 5, type: '入口' },
];

const columns: ColumnType<Row>[] = [
  { title: '名称', dataIndex: 'name', width: '2fr' },
  { title: '类型', dataIndex: 'type' },
  { title: '大小 (KB)', dataIndex: 'size', align: 'right' },
];

export function TablePagedExample() {
  const toast = useToast();
  return (
    // onRow 给行挂事件;点击选择列内部不会误触发 onClick
    <Table columns={columns} dataSource={rows}
           pagination={{ pageSize: 3 }}
           onRow={(r) => ({ onClick: () => toast({ level: 'info', title: '行点击', message: r.name }) })} />
  );
}`,
    },
  ],
  props: [
    { name: 'columns', type: 'ColumnType<T>[]', description: '列定义(必填)。' },
    { name: 'dataSource', type: 'T[]', description: '数据源(必填)。' },
    { name: 'rowKey', type: 'string | (record) => string', default: "'key'", description: '行唯一键字段或取键函数。' },
    { name: 'pagination', type: 'false | { pageSize?: number }', default: '{ pageSize: 10 }', description: '内置分页;false 关闭。' },
    { name: 'rowSelection', type: 'TableRowSelection<T>', description: '行选择配置,见下表。' },
    { name: 'loading', type: 'boolean', description: '加载遮罩(Spin,150ms 延迟)。' },
    { name: 'striped', type: 'boolean', default: 'false', description: '斑马纹。' },
    { name: 'size', type: "'small' | 'middle'", default: "'middle'", description: 'small 紧凑密度(行高 32)。' },
    { name: 'empty', type: 'ReactNode', default: '<Empty image="simple" />', description: '无数据占位。' },
    { name: 'maxHeight', type: 'number', default: '320', description: '表体滚动高度上限(表头吸顶)。' },
    { name: 'onRow', type: '(record) => { onClick? }', description: '行级事件工厂。' },
  ],
  extraApis: [
    {
      title: 'TableRowSelection',
      rows: [
        { name: 'type', type: "'checkbox' | 'radio'", default: "'checkbox'", description: '多选 / 单选。' },
        { name: 'selectedRowKeys / defaultSelectedRowKeys', type: 'string[]', description: '受控 / 非受控选中键集。' },
        { name: 'onChange', type: '(keys: string[], rows: T[]) => void', description: '选中变化(附选中行数据)。' },
        { name: 'getCheckboxProps', type: '(record) => { disabled?: boolean }', description: '按行禁用选择。' },
      ],
    },
    {
      title: 'ColumnType',
      rows: [
        { name: 'title', type: 'ReactNode', description: '表头(必填)。' },
        { name: 'dataIndex', type: 'keyof T', description: '取值字段;与 render 二选一或组合。' },
        { name: 'key', type: 'string', description: '列唯一键,缺省取 dataIndex。' },
        { name: 'render', type: '(value, record, index) => ReactNode', description: '自定义单元格。' },
        { name: 'sorter', type: '(a, b) => number', description: '比较器;提供即表头可点排序。' },
        { name: 'align', type: "'left' | 'right'", default: "'left'", description: '对齐(数字列用 right)。' },
        { name: 'width', type: 'string', default: "'1fr'", description: 'grid 轨道宽,如 2fr / 120px。' },
      ],
    },
  ],
};

function TableSelection() {
  const [keys, setKeys] = useState<string[]>(['2']);
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Table columns={COLS} dataSource={ROWS} pagination={false}
             rowSelection={{
               selectedRowKeys: keys,
               onChange: (k) => setKeys(k),
               getCheckboxProps: (r) => ({ disabled: r.type === '入口' }),
             }} />
      <span style={{ color: 'var(--text-2)', fontSize: 12.5 }}>已选 {keys.length} 行:{keys.join(', ') || '(无)'}</span>
    </div>
  );
}

function TableLoading() {
  const [loading, setLoading] = useState(false);
  const load = () => { setLoading(true); setTimeout(() => setLoading(false), 1600); };
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Table columns={COLS} dataSource={ROWS.slice(0, 3)} pagination={false} loading={loading} />
      <Button size="small" style={{ alignSelf: 'flex-start' }} onClick={load} disabled={loading}>模拟加载</Button>
    </div>
  );
}

function TablePaged() {
  const toast = useToast();
  return (
    <div style={{ width: '100%' }}>
      <Table columns={COLS} dataSource={ROWS} pagination={{ pageSize: 3 }}
             onRow={(r) => ({ onClick: () => toast({ level: 'info', title: '行点击', message: r.name }) })} />
    </div>
  );
}

const datagrid: DocDef = {
  key: 'datagrid',
  name: 'DataGrid',
  cn: '数据网格',
  description:
    '受控底座版表格:排序与选中完全由外部状态驱动(sort / onSort / selected / onSelect),不含分页,适合虚拟化、服务端排序等需要完全掌控数据流的场景。日常业务列表直接用 Table。',
  importCode: `import { DataGrid, type DataGridColumn } from '@fluent-react/ui';`,
  sections: [
    {
      title: '受控排序与选中',
      demo: <DataGridDemo />,
      code: `
import { useState } from 'react';
import { DataGrid, type DataGridColumn } from '@fluent-react/ui';

interface Row { id: string; name: string; size: number }

const rows: Row[] = [
  { id: '1', name: 'theme.css', size: 48 },
  { id: '2', name: 'Button.tsx', size: 2 },
  { id: '3', name: 'Table.tsx', size: 6 },
  { id: '4', name: 'bridge.ts', size: 4 },
];

const columns: DataGridColumn<Row>[] = [
  { key: 'name', title: '名称', width: '2fr', sortable: true },
  { key: 'size', title: '大小 (KB)', width: '1fr', sortable: true, align: 'right' },
];

export function DataGridExample() {
  // 排序与选中均为受控:组件只发事件,数据流由外部掌握
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  // 根据 sort 状态自行排好序再传入(服务端排序场景改为请求接口)
  const shown = sort
    ? [...rows].sort((a, b) => {
        const d = sort.key === 'size' ? a.size - b.size : a.name.localeCompare(b.name);
        return sort.dir === 'asc' ? d : -d;
      })
    : rows;
  return (
    <DataGrid columns={columns} rows={shown}
              sort={sort} onSort={(key, dir) => setSort({ key, dir })}
              selected={selected} onSelect={setSelected} />
  );
}`,
    },
  ],
  props: [
    { name: 'columns', type: 'DataGridColumn<Row>[]', description: '列:{ key, title, width, sortable?, align?, render? }(width 必填)。' },
    { name: 'rows', type: 'Row[](需含 id: string)', description: '当前显示的行(排序自行处理后传入)。' },
    { name: 'selected', type: 'string | null', description: '受控选中行 id。' },
    { name: 'sort', type: "{ key; dir: 'asc' | 'desc' } | null", description: '受控排序态(驱动表头箭头)。' },
  ],
  events: [
    { name: 'onSelect', type: '(id: string, row: Row) => void', description: '行点击。' },
    { name: 'onSort', type: "(key: string, dir) => void", description: '点击可排序表头(方向已循环好)。' },
  ],
};

function DataGridDemo() {
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const cols: DataGridColumn<{ id: string; name: string; size: number }>[] = [
    { key: 'name', title: '名称', width: '2fr', sortable: true },
    { key: 'size', title: '大小 (KB)', width: '1fr', sortable: true, align: 'right' },
  ];
  const rows = ROWS.map((r) => ({ id: r.key, name: r.name, size: r.size }));
  const shown = sort
    ? [...rows].sort((a, b) => {
        const d = sort.key === 'size' ? a.size - b.size : a.name.localeCompare(b.name);
        return sort.dir === 'asc' ? d : -d;
      })
    : rows;
  return (
    <div style={{ width: '100%' }}>
      <DataGrid columns={cols} rows={shown} sort={sort} onSort={(key, dir) => setSort({ key, dir })}
                selected={sel} onSelect={setSel} />
    </div>
  );
}

export const collectionDocs: DocDef[] = [table, datagrid];
