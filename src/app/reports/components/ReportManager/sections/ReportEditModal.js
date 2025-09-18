'use client';
import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import { Modal, Form, Input, Select, DatePicker, InputNumber } from 'antd';
import TileTemplateSelector from '@/components/TileTemplateSelector';

const { TextArea } = Input;

export default function ReportEditModal({ open, onClose, onSave, initialData }) {
    const [form] = Form.useForm();

    // Fill form when editing existing report
    useEffect(() => {
        if (initialData) {
            const filledData = {
                ...initialData,
                report_publish_date: initialData.report_publish_date ? dayjs(initialData.report_publish_date) : null,
            };
            form.setFieldsValue(filledData);
        } else {
            form.resetFields();
        }
    }, [initialData, form]);


    const handleOk = () => {
        form.validateFields()
            .then(values => {
                console.log('Form values:', values);
                onSave(values);
                onClose();   // comment out to see if data is logged
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };


    return (
        <Modal
            open={open}
            title={initialData ? "Edit Report" : "Add New Report"}
            onOk={handleOk}
            onCancel={onClose}
            okText="Save"
            width="90vw"
        >
            <Form form={form} layout="vertical">

                <Form.Item name="report_id" label="Report ID" rules={[{ required: true, message: 'Please enter unique Report ID' }]}>
                    <Input />
                </Form.Item>

                <Form.Item
                    name="tileTemplateId"
                    label="Select Tile Template"
                    rules={[{ required: true, message: 'Please select a tile template' }]}
                >
                    <TileTemplateSelector />
                </Form.Item>

                <Form.Item name="report_title" label="Report Title" rules={[{ required: true, message: 'Please enter title' }]}>
                    <Input />
                </Form.Item>

                <Form.Item name="report_summary" label="Report Summary">
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item name="report_scope" label="Report Scope">
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item name="reasons_to_buy" label="Reasons to Buy">
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item name="Table_of_Contents" label="Table of Contents">
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item name="list_of_tables" label="List of Tables">
                    <Input.TextArea rows={2} />
                </Form.Item>

                <Form.Item name="List_of_figures" label="List of Figures">
                    <Input.TextArea rows={2} />
                </Form.Item>

                <Form.Item name="Report_Geography_Region" label="Geography Region">
                    <Input />
                </Form.Item>

                <Form.Item name="Report_Geography_Country" label="Geography Country">
                    <Input />
                </Form.Item>

                <Form.Item name="Product_category" label="Product Category">
                    <Input />
                </Form.Item>

                <Form.Item name="Product_sub_Category" label="Product Sub-Category">
                    <Input />
                </Form.Item>

                <Form.Item name="report_type" label="Report Type">
                    <Select options={[
                        { value: 'Databook', label: 'Databook' },
                        { value: 'Insight', label: 'Insight' },
                        { value: 'Brief', label: 'Brief' },
                    ]} />
                </Form.Item>

                <Form.Item name="report_format" label="Report Format">
                    <Select options={[
                        { value: 'PDF', label: 'PDF' },
                        { value: 'Excel', label: 'Excel' },
                        { value: 'Interactive Excel', label: 'Interactive Excel' },
                    ]} />
                </Form.Item>

                <Form.Item name="report_publisher" label="Report Publisher">
                    <Input />
                </Form.Item>

                <Form.Item name="report_pages" label="Report Pages">
                    <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item name="Companies_mentioned" label="Companies Mentioned">
                    <Input />
                </Form.Item>

                <Form.Item name="single_user_dollar_price" label="Single User Dollar Price">
                    <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item name="Small_Team_dollar_price" label="Small Team Dollar Price">
                    <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item name="Enterprise_dollar_price" label="Enterprise Dollar Price">
                    <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item name="Featured_Report_Status" label="Featured Report Status">
                    <Select options={[
                        { value: 1, label: 'Featured' },
                        { value: 0, label: 'Not Featured' },
                    ]} />
                </Form.Item>

                <Form.Item name="report_visible" label="Report Visible">
                    <Select options={[
                        { value: 0, label: 'Visible to all users' },
                        { value: 1, label: 'Only paid users' },
                        { value: 2, label: 'Not visible to any user' },
                        { value: 3, label: 'Visible to free users but not paid users' },
                    ]} />
                </Form.Item>

                <Form.Item name="Home_Page" label="Show on Home Page">
                    <Select options={[
                        { value: 1, label: 'Yes' },
                        { value: 0, label: 'No' },
                    ]} />
                </Form.Item>

                <Form.Item name="report_file_name" label="Report File Name">
                    <Input />
                </Form.Item>

                <Form.Item name="report_publish_date" label="Report Publish Date">
                    <DatePicker style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item name="Sample_Page_report_name" label="Sample Page Report Name">
                    <Input />
                </Form.Item>

                <Form.Item name="Meta_Description" label="Meta Description">
                    <Input.TextArea rows={2} />
                </Form.Item>

                <Form.Item name="Meta_Title" label="Meta Title">
                    <Input />
                </Form.Item>

                <Form.Item name="Meta_Keyword" label="Meta Keyword">
                    <Input />
                </Form.Item>

                <Form.Item name="seo_url" label="SEO URL">
                    <Input />
                </Form.Item>
                <Form.Item name="key_stats_a1" label="Key Stats A1">
                    <Input style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item name="key_stats_a2" label="Key Stats A2">
                    <Input />
                </Form.Item>

                <Form.Item name="key_stats_b1" label="Key Stats B1">
                    <Input style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item name="key_stats_b2" label="Key Stats B2">
                    <Input />
                </Form.Item>

                <Form.Item name="key_stats_c1" label="Key Stats C1">
                    <Input style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item name="key_stats_c2" label="Key Stats C2">
                    <Input />
                </Form.Item>

                <Form.Item name="key_stats_d1" label="Key Stats D1">
                    <Input style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item name="key_stats_d2" label="Key Stats D2">
                    <Input />
                </Form.Item>

                <Form.Item name="RD_Section1" label="Research Deliverable Section 1">
                    <Input.TextArea rows={2} />
                </Form.Item>

                <Form.Item name="RD_Section2" label="Research Deliverable Section 2">
                    <Input.TextArea rows={2} />
                </Form.Item>

                <Form.Item name="RD_Section3" label="Research Deliverable Section 3">
                    <Input.TextArea rows={2} />
                </Form.Item>

                <Form.Item name="RD_Text_Section1" label="Research Deliverable Text Section 1">
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item name="RD_Text_Section2" label="Research Deliverable Text Section 2">
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item name="RD_Text_Section3" label="Research Deliverable Text Section 3">
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item name="FAQs" label="FAQs">
                    <Input.TextArea rows={3} />
                </Form.Item>
            </Form>

        </Modal>
    );
}
