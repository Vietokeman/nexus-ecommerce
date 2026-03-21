import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stack,
  Typography,
  TextField,
  Button,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  InputAdornment,
} from '@mui/material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { useAuthStore } from '@/store/auth-store';
import type { AIContentResponse, CreateSellerProductDto } from '@/types/seller';
import { nexus } from '@/theme/theme';

const categories = [
  'Thời trang nam',
  'Thời trang nữ',
  'Điện tử',
  'Gia dụng',
  'Mỹ phẩm',
  'Thực phẩm',
  'Sách',
  'Thể thao',
  'Khác',
];

export default function SellerCreateProductPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiContent, setAiContent] = useState<AIContentResponse | null>(null);
  const [form, setForm] = useState({
    no: '',
    name: '',
    summary: '',
    basicDescription: '',
    price: 0,
    category: '',
    imageUrl: '',
    stockQuantity: 0,
  });

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateAI = async () => {
    if (!form.name) {
      toast.error('Vui lòng nhập tên sản phẩm trước khi dùng AI');
      return;
    }
    setIsGenerating(true);
    try {
      const { data } = await api.post(API_ENDPOINTS.SELLER.PREVIEW_AI, {
        productName: form.name,
        category: form.category || undefined,
        basicDescription: form.basicDescription || undefined,
        price: form.price,
      });
      setAiContent(data);
      toast.success('AI đã tạo nội dung thành công!');
    } catch {
      toast.error('Lỗi khi tạo nội dung AI');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.no || !form.name) {
      toast.error('Vui lòng điền mã sản phẩm và tên sản phẩm');
      return;
    }
    setIsSubmitting(true);
    try {
      const dto: CreateSellerProductDto = {
        no: form.no,
        sellerUserName: user?.userName || user?.email || 'default_seller',
        name: form.name,
        summary: form.summary || undefined,
        basicDescription: form.basicDescription || undefined,
        price: form.price,
        category: form.category || undefined,
        imageUrl: form.imageUrl || undefined,
        stockQuantity: form.stockQuantity,
        useAI: !aiContent, // nếu chưa generate AI thì tự generate khi create
      };

      await api.post(API_ENDPOINTS.SELLER.PRODUCTS, dto);
      toast.success('Sản phẩm đã được đăng thành công!');
      navigate('/seller/products');
    } catch (err: any) {
      toast.error(err?.response?.data || 'Lỗi khi đăng sản phẩm');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Stack spacing={3} sx={{ maxWidth: 900, mx: 'auto', py: 4 }}>
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
          📦 Đăng Sản Phẩm Mới
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Nhập thông tin cơ bản, AI sẽ tự động viết mô tả và tối ưu SEO cho bạn
        </Typography>

        {/* Basic Info */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid #EBDDC9',
            background:
              'linear-gradient(145deg, rgba(255,248,236,0.9), rgba(240,251,248,0.88) 60%, rgba(255,255,255,0.96))',
            boxShadow: '0 16px 30px rgba(126, 93, 53, 0.1)',
          }}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Thông tin cơ bản
          </Typography>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Mã sản phẩm *"
                placeholder="VD: SP-001"
                value={form.no}
                onChange={(e) => handleChange('no', e.target.value)}
                sx={{ flex: 1 }}
                size="small"
              />
              <FormControl sx={{ flex: 1 }} size="small">
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={form.category}
                  label="Danh mục"
                  onChange={(e) => handleChange('category', e.target.value)}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <TextField
              label="Tên sản phẩm *"
              placeholder="VD: Áo Sơ Mi Nam Oxford Cao Cấp"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              fullWidth
              size="small"
            />

            <TextField
              label="Tóm tắt ngắn"
              placeholder="Mô tả ngắn gọn về sản phẩm"
              value={form.summary}
              onChange={(e) => handleChange('summary', e.target.value)}
              fullWidth
              size="small"
            />

            <TextField
              label="Mô tả cơ bản (cho AI tham khảo)"
              placeholder="Nhập vài dòng mô tả, AI sẽ viết chi tiết và chuẩn SEO cho bạn..."
              value={form.basicDescription}
              onChange={(e) => handleChange('basicDescription', e.target.value)}
              fullWidth
              multiline
              rows={3}
              size="small"
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Giá (VNĐ) *"
                type="number"
                value={form.price}
                onChange={(e) => handleChange('price', Number(e.target.value))}
                sx={{ flex: 1 }}
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">₫</InputAdornment>,
                }}
              />
              <TextField
                label="Số lượng tồn kho"
                type="number"
                value={form.stockQuantity}
                onChange={(e) => handleChange('stockQuantity', Number(e.target.value))}
                sx={{ flex: 1 }}
                size="small"
              />
            </Stack>

            <TextField
              label="URL Ảnh sản phẩm"
              placeholder="https://example.com/image.jpg"
              value={form.imageUrl}
              onChange={(e) => handleChange('imageUrl', e.target.value)}
              fullWidth
              size="small"
            />

            {form.imageUrl && (
              <img
                src={form.imageUrl}
                alt="Preview"
                style={{
                  width: 200,
                  height: 200,
                  objectFit: 'cover',
                  borderRadius: 12,
                  border: '2px solid #e0e0e0',
                  boxShadow: '0 12px 24px rgba(124, 92, 52, 0.14)',
                }}
              />
            )}
          </Stack>
        </Paper>

        {/* AI Generate Button */}
        <Button
          variant="contained"
          onClick={handleGenerateAI}
          disabled={!form.name || isGenerating}
          sx={{
            background: nexus.gradient.button,
            py: 1.5,
            fontWeight: 700,
            fontSize: '1rem',
            borderRadius: 999,
          }}
          startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : undefined}
        >
          {isGenerating ? 'AI đang viết mô tả...' : '🤖 AI Viết Mô Tả & SEO'}
        </Button>

        {/* AI Generated Content Preview */}
        {aiContent && (
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(145deg, rgba(255,248,236,0.9), rgba(240,251,248,0.9))',
              border: '1px solid #E4C48F',
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6" fontWeight={600} color="primary">
                  🤖 Nội dung AI đã tạo
                </Typography>
                <Chip label="AI Generated" size="small" color="secondary" />
              </Stack>

              <Divider />

              <div>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Mô tả sản phẩm
                </Typography>
                <Paper sx={{ p: 2, whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                  {aiContent.description}
                </Paper>
              </div>

              <Stack direction="row" spacing={2}>
                <div style={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    SEO Title
                  </Typography>
                  <Paper sx={{ p: 1.5, fontSize: '0.85rem' }}>{aiContent.seoTitle}</Paper>
                </div>
                <div style={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    SEO Description
                  </Typography>
                  <Paper sx={{ p: 1.5, fontSize: '0.85rem' }}>{aiContent.seoDescription}</Paper>
                </div>
              </Stack>

              <div>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  SEO Keywords
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {aiContent.seoKeywords.split(',').map((kw, i) => (
                    <Chip
                      key={i}
                      label={`#${kw.trim()}`}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </Stack>
              </div>

              <div>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Điểm nổi bật
                </Typography>
                <Stack spacing={0.5}>
                  {aiContent.highlights.split('|').map((h, i) => (
                    <Typography key={i} variant="body2">
                      ✅ {h.trim()}
                    </Typography>
                  ))}
                </Stack>
              </div>

              <Button
                variant="outlined"
                onClick={handleGenerateAI}
                disabled={isGenerating}
                size="small"
              >
                🔄 Viết lại
              </Button>
            </Stack>
          </Paper>
        )}

        {/* Submit */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmit}
            disabled={isSubmitting || !form.no || !form.name}
            sx={{ flex: 1, py: 1.5, fontWeight: 600 }}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : undefined}
          >
            {isSubmitting ? 'Đang đăng...' : '🚀 Đăng Sản Phẩm'}
          </Button>
          <Button variant="outlined" onClick={() => navigate('/seller/products')} sx={{ px: 4 }}>
            Hủy
          </Button>
        </Stack>

        {!aiContent && (
          <Alert severity="info">
            💡 Bấm "AI Viết Mô Tả & SEO" để AI tự động tạo nội dung chuẩn SEO cho sản phẩm. Bạn cũng
            có thể đăng trực tiếp và AI sẽ tự generate.
          </Alert>
        )}
      </Stack>
    </motion.div>
  );
}
