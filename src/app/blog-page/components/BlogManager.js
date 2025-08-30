'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tooltip, Upload, Collapse, Tag, DatePicker, Select, Pagination, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import Cookies from 'js-cookie';
import dayjs from 'dayjs';
import TiptapEditor from '@/components/TiptapEditor';
import TileTemplateSelector from '@/components/TileTemplateSelector';
import Tile from '@/components/Tile';
import BlogCsvUploadModal from './BlogCsvUploadModal';

const { Panel } = Collapse;

export default function BlogManager() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBlog, setEditBlog] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [blogForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState([]);
  const [sortKey, setSortKey] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterSubcategory, setFilterSubcategory] = useState('');
  const [filterTopic, setFilterTopic] = useState('');

  const userRole = Cookies.get('admin_role');
  const canEdit = ['superadmin', 'editor', 'blogger'].includes(userRole);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/product-category');
        const data = await res.json();
        if (data.success) setCategories(data.data);
        else message.error('Failed to load categories');
      } catch (error) {
        console.error('Error loading categories:', error);
        message.error('Error loading categories');
      }
    };

    const fetchSubcategories = async () => {
      try {
        const res = await fetch('/api/product-subcategory');
        const data = await res.json();
        if (data.success) setSubcategories(data.data);
        else message.error('Failed to load subcategories');
      } catch (error) {
        console.error('Error loading subcategories:', error);
        message.error('Error loading subcategories');
      }
    };

    const fetchTopics = async () => {
      try {
        const res = await fetch('/api/product-topic');
        const data = await res.json();
        if (data.success) setTopics(data.data);
        else message.error('Failed to load topics');
      } catch (error) {
        console.error('Error loading topics:', error);
        message.error('Error loading topics');
      }
    };

    const fetchSubtopics = async () => {
      try {
        const res = await fetch('/api/product-subtopic');
        const data = await res.json();
        if (data.success) setSubtopics(data.data);
        else message.error('Failed to load subtopics');
      } catch (error) {
        console.error('Error loading subtopics:', error);
        message.error('Error loading subtopics');
      }
    };

    fetchTopics();
    fetchSubtopics();
    fetchSubcategories();
    fetchCategories();
    fetchBlogs();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when search, sort, or filters change
  }, [searchText, sortKey, sortOrder, filterSubcategory, filterTopic]);

  const handleDownloadCSV = () => {
    if (!blogs || blogs.length === 0) {
      message.warning('No blogs to download');
      return;
    }

    // Define the exact field order - using exact DB field names
    const fields = [
      'title',
      'summary',
      'slug',
      'articlePart1',
      'articlePart2',
      'category',
      'subcategory',
      'topic',
      'subtopic',
      'date',
      'is_featured',
      'tileTemplateId',
      'advertisement_title',
      'advertisement_description',
      'advertisement_url',
      'imageIconurl'
    ];

    // Prepare data: ensure all objects have all fields (even if null)
    const dataToExport = blogs.map(blog => {
      const newItem = {};
      fields.forEach(f => {
        // Handle special fields
        if (f === 'tileTemplateId') {
          if (blog[f]) {
            // If it's populated (object), get the _id, otherwise use the ObjectId string
            newItem[f] = typeof blog[f] === 'object' && blog[f]._id ? blog[f]._id : blog[f];
          } else {
            newItem[f] = '';
          }
        } else if (f === 'advertisement_title') {
          newItem[f] = blog.advertisement?.title || '';
        } else if (f === 'advertisement_description') {
          newItem[f] = blog.advertisement?.description || '';
        } else if (f === 'advertisement_url') {
          newItem[f] = blog.advertisement?.url || '';
        } else if (f === 'date') {
          newItem[f] = blog[f] ? new Date(blog[f]).toISOString().split('T')[0] : '';
        } else if (['category', 'subcategory', 'topic', 'subtopic'].includes(f)) {
          newItem[f] = Array.isArray(blog[f]) ? blog[f].join(', ') : (blog[f] || '');
        } else if (f === 'is_featured') {
          newItem[f] = blog[f] ? 'true' : 'false';
        } else {
          newItem[f] = blog[f] !== undefined ? blog[f] : '';
        }
      });
      return newItem;
    });

    // Create CSV content
    const csvHeaders = fields.join(',');
    const csvRows = dataToExport.map(row => 
      fields.map(field => {
        const value = row[field] || '';
        // Escape quotes and wrap in quotes if contains comma or quote
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    );
    
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `blogs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blog-page/blog-content');
      const data = await response.json();
      if (data.success) setBlogs(data.data);
      else message.error('Failed to fetch blogs');
    } catch (error) {
      console.error('Error fetching blogs:', error);
      message.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleBlogSubmit = async (values) => {
    if (!canEdit) return message.error('Permission denied');

    try {
      const formData = new FormData();

      if (editBlog?._id) formData.append('_id', editBlog._id);

      const datePart = values.date
        ? values.date.format('YYYY-MM-DD')
        : new Date().toISOString().split('T')[0];
      const slug = values.slug?.trim()
        || values.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      formData.append('title', values.title || '');
      formData.append('summary', values.summary || '');
      formData.append('articlePart1', values.articlePart1 || '');
      formData.append('articlePart2', values.articlePart2 || '');
      formData.append('slug', slug);
      formData.append('category', JSON.stringify(values.category || []));
      formData.append('subcategory', JSON.stringify(values.subcategory || []));
      formData.append('topic', JSON.stringify(values.topic || []));
      formData.append('subtopic', JSON.stringify(values.subtopic || []));
      formData.append('date', datePart);
      formData.append('is_featured', values.is_featured);

      formData.append('advertisement', JSON.stringify({
        title: values.advertisement?.title || '',
        description: values.advertisement?.description || '',
        url: values.advertisement?.url || '',
      }));

      // Validate tileTemplateId
      if (values.tileTemplateId) {
        if (/^[0-9a-fA-F]{24}$/.test(values.tileTemplateId)) {
          formData.append('tileTemplateId', values.tileTemplateId);
        } else {
          message.error('Invalid tile template ID');
          return;
        }
      } else {
        message.error('Tile template is required');
        return;
      }

      const response = await fetch('/api/blog-page/blog-content', { method: 'POST', body: formData });
      const result = await response.json();

      if (result.success) {
        message.success(editBlog ? 'Blog updated' : 'Blog added');
        setModalOpen(false);
        setEditBlog(null);
        blogForm.resetFields();
        fetchBlogs();
      } else {
        message.error(result.message || 'Error submitting blog');
      }
    } catch (error) {
      console.error('Error submitting blog:', error);
      message.error('Error submitting blog');
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!canEdit) return message.error('Permission denied');
    try {
      const response = await fetch(`/api/blog-page/blog-content?id=${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        message.success('Blog deleted');
        fetchBlogs();
      } else {
        message.error(result.message || 'Error deleting blog');
      }
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Error deleting blog');
    }
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0] || ''}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90, marginRight: 8 }}
          onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
        >
          Search
        </Button>
        <Button size="small" style={{ width: 90 }} onClick={() => handleReset(clearFilters)}>Reset</Button>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, filteredBlogs) =>
      filteredBlogs[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const filteredAndSortedBlogs = blogs
    .filter((blog) => {
      const searchLower = searchText.toLowerCase();
      const matchSearch = !searchText || [
        blog.title,
        blog.summary,
        blog.slug,
        ...(Array.isArray(blog.category) ? blog.category : [blog.category]),
        ...(Array.isArray(blog.subcategory) ? blog.subcategory : [blog.subcategory]),
        ...(Array.isArray(blog.topic) ? blog.topic : [blog.topic]),
        ...(Array.isArray(blog.subtopic) ? blog.subtopic : [blog.subtopic]),
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(searchLower));

      const matchSubcat = !filterSubcategory || (
        Array.isArray(blog.subcategory)
          ? blog.subcategory.includes(filterSubcategory)
          : blog.subcategory === filterSubcategory
      );

      const matchTopic = !filterTopic || (
        Array.isArray(blog.topic)
          ? blog.topic.includes(filterTopic)
          : blog.topic === filterTopic
      );

      return matchSearch && matchSubcat && matchTopic;
    })
    .sort((a, b) => {
      if (!sortKey) return 0;

      let valA, valB;

      switch (sortKey) {
        case 'title':
          valA = a.title?.toLowerCase() || '';
          valB = b.title?.toLowerCase() || '';
          break;
        case 'summary':
          valA = a.summary?.toLowerCase() || '';
          valB = b.summary?.toLowerCase() || '';
          break;
        case 'slug':
          valA = a.slug?.toLowerCase() || '';
          valB = b.slug?.toLowerCase() || '';
          break;
        case 'date':
          valA = new Date(a.date || 0).getTime();
          valB = new Date(b.date || 0).getTime();
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        case 'category':
          valA = Array.isArray(a.category) ? a.category.join(', ').toLowerCase() : a.category?.toLowerCase() || '';
          valB = Array.isArray(b.category) ? b.category.join(', ').toLowerCase() : b.category?.toLowerCase() || '';
          break;
        case 'subcategory':
          valA = Array.isArray(a.subcategory) ? a.subcategory.join(', ').toLowerCase() : a.subcategory?.toLowerCase() || '';
          valB = Array.isArray(b.subcategory) ? b.subcategory.join(', ').toLowerCase() : b.subcategory?.toLowerCase() || '';
          break;
        case 'topic':
          valA = Array.isArray(a.topic) ? a.topic.join(', ').toLowerCase() : a.topic?.toLowerCase() || '';
          valB = Array.isArray(b.topic) ? b.topic.join(', ').toLowerCase() : b.topic?.toLowerCase() || '';
          break;
        case 'subtopic':
          valA = Array.isArray(a.subtopic) ? a.subtopic.join(', ').toLowerCase() : a.subtopic?.toLowerCase() || '';
          valB = Array.isArray(b.subtopic) ? b.subtopic.join(', ').toLowerCase() : b.subtopic?.toLowerCase() || '';
          break;
        default:
          return 0;
      }

      const comparison = typeof valA === 'string' ? valA.localeCompare(valB) : valA - valB;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  const totalBlogs = filteredAndSortedBlogs.length;
  const paginatedBlogs = filteredAndSortedBlogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Blogs</h2>
        <div className="flex gap-2">
          {canEdit && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditBlog(null);
                blogForm.resetFields();
                setModalOpen(true);
              }}
            >
              Add Blog
            </Button>
          )}
          <Button
            type="primary"
            onClick={() => setUploadModalOpen(true)}
          >
            Upload CSV
          </Button>
          <Button
            type="primary"
            onClick={handleDownloadCSV}
          >
            Download CSV
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <Input.Search
          placeholder="Search blogs..."
          onChange={(e) => setSearchText(e.target.value.toLowerCase())}
          style={{ width: 200 }}
        />
        <Select
          value={sortKey}
          onChange={(value) => setSortKey(value)}
          style={{ width: 180 }}
          placeholder="Sort By"
        >
          <Select.Option value="">No Sort</Select.Option>
          <Select.Option value="title">Title</Select.Option>
          <Select.Option value="summary">Summary</Select.Option>
          <Select.Option value="slug">Slug</Select.Option>
          <Select.Option value="date">Date</Select.Option>
          <Select.Option value="category">Product Category</Select.Option>
          <Select.Option value="subcategory">Product Subcategory</Select.Option>
          <Select.Option value="topic">Product Topic</Select.Option>
          <Select.Option value="subtopic">Product Subtopic</Select.Option>
        </Select>
        <Select
          value={sortOrder}
          onChange={(value) => setSortOrder(value)}
          style={{ width: 140 }}
          placeholder="Order"
        >
          <Select.Option value="asc">Ascending</Select.Option>
          <Select.Option value="desc">Descending</Select.Option>
        </Select>
        <Select
          value={filterSubcategory}
          onChange={(value) => setFilterSubcategory(value)}
          style={{ width: 200 }}
          placeholder="Filter by Subcategory"
          allowClear
          showSearch
          optionFilterProp="children"
        >
          {subcategories.map((sub) => (
            <Select.Option key={sub._id} value={sub.subProductName}>
              {sub.subProductName}
            </Select.Option>
          ))}
        </Select>
        <Select
          value={filterTopic}
          onChange={(value) => setFilterTopic(value)}
          style={{ width: 200 }}
          placeholder="Filter by Topic"
          allowClear
          showSearch
          optionFilterProp="children"
        >
          {topics.map((topic) => (
            <Select.Option key={topic._id} value={topic.productTopicName}>
              {topic.productTopicName}
            </Select.Option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
          <span className="ml-3 text-gray-500">Loading blogs...</span>
        </div>
      ) : (
        <>
          <Collapse accordion>
            {paginatedBlogs.map((blog) => (
              <Panel
                header={
                  <div className="blog-panel-header">
                    <Tooltip
                      title={
                        blog.tileTemplateId ? (
                          <div>
                            <div><strong>Tile Template:</strong> {blog.tileTemplateId.name}</div>
                            <div><strong>Type:</strong> {blog.tileTemplateId.type}</div>
                            <div><strong>Icon:</strong> {blog.tileTemplateId.iconName}</div>
                          </div>
                        ) : (
                          'No tile template selected'
                        )
                      }
                      placement="top"
                    >
                      <div
                        className="blog-tile-container"
                        style={{
                          backgroundColor: blog.tileTemplateId?.useTileBgEverywhere
                            ? blog.tileTemplateId?.backgroundColor
                            : (blog.tileTemplateId?.previewBackgroundColor || '#f8f9fa')
                        }}
                      >
                        {blog.tileTemplateId ? (
                          <Tile
                            bg={blog.tileTemplateId.backgroundColor}
                            icon={blog.tileTemplateId.iconName}
                            color={blog.tileTemplateId.iconColor}
                            size={blog.tileTemplateId.iconSize}
                          />
                        ) : (
                          <div className="text-gray-400 text-xs text-center">
                            No Tile
                          </div>
                        )}
                        {/* Tile Template Badge */}
                        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-1 py-0.5 rounded-full">
                          Tile
                        </div>
                      </div>
                    </Tooltip>
                    <div>
                      <div className="font-medium">{blog.title}</div>
                      <div className="text-gray-500">{blog.summary}</div>
                      <div className="text-xs">{new Date(blog.date).toLocaleDateString('en-GB')}</div>
                      <b>SubCategory:</b>{' '}
                      {Array.isArray(blog.subcategory) && blog.subcategory.length ? (
                        blog.subcategory.map((sub) => <Tag key={sub}>{sub}</Tag>)
                      ) : typeof blog.subcategory === 'string' && blog.subcategory ? (
                        <Tag>{blog.subcategory}</Tag>
                      ) : (
                        '-'
                      )}
                      <b>Topic:</b>{' '}
                      {Array.isArray(blog.topic) && blog.topic.length ? (
                        blog.topic.map((top) => <Tag key={top}>{top}</Tag>)
                      ) : typeof blog.topic === 'string' && blog.topic ? (
                        <Tag>{blog.topic}</Tag>
                      ) : (
                        '-'
                      )}
                    </div>
                  </div>
                }
                key={blog._id}
              >
                <b>Category:</b>{' '}
                {Array.isArray(blog.category) && blog.category.length ? (
                  blog.category.map((cat) => <Tag key={cat}>{cat}</Tag>)
                ) : typeof blog.category === 'string' && blog.category ? (
                  <Tag>{blog.category}</Tag>
                ) : (
                  '-'
                )}


                <b>SubTopic:</b>{' '}
                {Array.isArray(blog.subtopic) && blog.subtopic.length ? (
                  blog.subtopic.map((subtop) => <Tag key={subtop}>{subtop}</Tag>)
                ) : typeof blog.subtopic === 'string' && blog.subtopic ? (
                  <Tag>{blog.subtopic}</Tag>
                ) : (
                  '-'
                )}
                <div className="mb-2 text-sm">
                  <b>Slug:</b> {blog.slug || '-'}
                </div>
                <div className="mb-2 text-sm">
                  <b>Is Featured:</b>{' '}
                  {blog.is_featured === true || blog.is_featured === 'true' ? (
                    <Tag color="green">True</Tag>
                  ) : (
                    <Tag color="red">False</Tag>
                  )}
                </div>

                {/* Tile Template Information */}
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-sm font-semibold text-gray-700">Tile Template:</div>
                    {blog.tileTemplateId ? (
                      <Tag color="blue">{blog.tileTemplateId.name}</Tag>
                    ) : (
                      <Tag color="red">No Template</Tag>
                    )}
                  </div>
                </div>
                <div className="mb-2 content-view">
                  <b>Article Part 1:</b>
                  <div dangerouslySetInnerHTML={{ __html: blog.articlePart1 }} />
                </div>
                <div className="mb-2 content-view">
                  <b>Article Part 2:</b>
                  <div dangerouslySetInnerHTML={{ __html: blog.articlePart2 }} />
                </div>
                <div className="mb-2">
                  <b>Ad Title -</b> {blog.advertisement?.title || '-'}
                  <div>
                    <b>Ad Description -</b> {blog.advertisement?.description || '-'}
                  </div>
                  <b>Ad URL -</b>{' '}
                  <a href={blog.advertisement?.url} target="_blank" rel="noreferrer">
                    {blog.advertisement?.url}
                  </a>
                </div>
                {canEdit && (
                  <div className="blog-actions">
                    <Button
                      icon={<EditOutlined />}
                      size="small"
                      onClick={() => {
                        setEditBlog(blog);
                        setSelectedCategory(blog.category);
                        setSelectedTopic(blog.topic);
                        blogForm.setFieldsValue({
                          ...blog,
                          is_featured: blog.is_featured,
                          advertisement: blog.advertisement || {},
                          tileTemplateId: blog.tileTemplateId?._id || null,
                          date: blog.date ? dayjs(blog.date) : null,
                        });
                        setModalOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Popconfirm title="Delete this blog?" onConfirm={() => handleDeleteBlog(blog._id)}>
                      <Button danger icon={<DeleteOutlined />} size="small">
                        Delete
                      </Button>
                    </Popconfirm>
                  </div>
                )}
              </Panel>
            ))}
          </Collapse>
          <div className="mt-4 flex justify-center">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalBlogs}
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
              showSizeChanger
              pageSizeOptions={['10', '20', '50']}
            />
          </div>
        </>
      )}
      {canEdit && (
        <Modal
          title={editBlog ? 'Edit Blog' : 'Add Blog'}
          open={modalOpen}
          onCancel={() => {
            setModalOpen(false);
            setEditBlog(null);
            blogForm.resetFields();
          }}
          footer={null}
          width="90vw"
        >
          <Form form={blogForm} layout="vertical" onFinish={handleBlogSubmit}>
            <Form.Item name="title" label="Title" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="summary" label="Summary" rules={[{ required: true }]} className="full-screen-editor">
              <TiptapEditor />
            </Form.Item>
            <Form.Item
              name="tileTemplateId"
              label="Select Tile Template"
              rules={[{ required: true, message: 'Please select a tile template' }]}
            >
              <TileTemplateSelector />
            </Form.Item>
            <Form.Item name="date" label="Date">
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="slug" label="Slug">
              <Input placeholder="Leave empty to auto-generate" />
            </Form.Item>
            <Form.Item name="category" label="Category">
              <Select
                mode="multiple"
                placeholder="Select categories"
                onChange={(value) => setSelectedCategory(value)}
                value={selectedCategory}
                showSearch
                optionFilterProp="children"
              >
                {categories.map((cat) => (
                  <Select.Option key={cat._id} value={cat.productCategoryName}>
                    {cat.productCategoryName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="subcategory" label="Subcategory">
              <Select
                mode="multiple"
                placeholder="Select subcategories"
                showSearch
                optionFilterProp="children"
              >
                {subcategories
                  .filter((sub) => selectedCategory.includes(sub.productCategoryId?.productCategoryName))
                  .map((sub) => (
                    <Select.Option key={sub._id} value={sub.subProductName}>
                      {sub.subProductName}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
            <Form.Item name="topic" label="Topic">
              <Select
                mode="multiple"
                placeholder="Select topics"
                onChange={(value) => setSelectedTopic(value)}
                value={selectedTopic}
                showSearch
                optionFilterProp="children"
              >
                {topics.map((topic) => (
                  <Select.Option key={topic._id} value={topic.productTopicName}>
                    {topic.productTopicName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="subtopic" label="Subtopic">
              <Select
                mode="multiple"
                placeholder="Select subtopics"
                showSearch
                optionFilterProp="children"
              >
                {subtopics
                  .filter((sub) => selectedTopic.includes(sub.productTopicId?.productTopicName))
                  .map((sub) => (
                    <Select.Option key={sub._id} value={sub.subProductName}>
                      {sub.subProductName}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
            <Form.Item name="articlePart1" label="Article Part 1" rules={[{ required: true }]} className="full-screen-editor">
              <TiptapEditor />
            </Form.Item>
            <Form.Item name="articlePart2" label="Article Part 2" rules={[{ required: true }]} className="full-screen-editor">
              <TiptapEditor />
            </Form.Item>
            <Form.Item name={['advertisement', 'title']} label="Ad Title">
              <Input />
            </Form.Item>
            <Form.Item name={['advertisement', 'description']} label="Ad Description">
              <Input.TextArea rows={5} />
            </Form.Item>
            <Form.Item name={['advertisement', 'url']} label="Ad URL">
              <Input />
            </Form.Item>
            <Form.Item name="is_featured" label="Is Featured" rules={[{ required: true }]}>
              <Select placeholder="Select if featured">
                <Select.Option value={true}>True</Select.Option>
                <Select.Option value={false}>False</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {editBlog ? 'Update' : 'Add'} Blog
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}

      <BlogCsvUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploaded={() => {
          fetchBlogs();
        }}
      />
    </div>
  );
}