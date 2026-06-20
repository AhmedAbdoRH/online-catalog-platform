'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const customerSchema = z.object({
  catalogId: z.number().int().positive(),
  name: z.string().trim().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(100, 'الاسم طويل جداً'),
  phone: z.string().trim().min(7, 'رقم الهاتف غير صالح').max(20, 'رقم الهاتف طويل جداً').regex(/^[0-9+\s-]+$/, 'رقم الهاتف يحتوي على رموز غير صالحة'),
  address: z.string().trim().max(300, 'العنوان طويل جداً').optional().or(z.literal('')),
})

export async function saveCustomerData(catalogId: number, name: string, phone: string, address: string) {
  // Validate inputs
  const validation = customerSchema.safeParse({ catalogId, name, phone, address })
  if (!validation.success) {
    const errorMsg = validation.error.errors[0]?.message || 'بيانات العميل غير صالحة'
    return { success: false, error: errorMsg }
  }

  const { name: cleanName, phone: cleanPhone, address: cleanAddress } = validation.data
  const supabase = await createClient()

  try {
    // Check if customer already exists for this catalog with the same phone
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('catalog_id', catalogId)
      .eq('phone', cleanPhone)
      .single()

    // If customer doesn't exist, add them
    if (!existingCustomer) {
      const { error } = await supabase
        .from('customers')
        .insert({
          catalog_id: catalogId,
          name: cleanName,
          phone: cleanPhone,
          address: cleanAddress || null,
        })

      if (error) {
        console.error('Error saving customer data:', error)
        return { success: false, error: error.message }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error saving customer data:', error)
    return { success: false, error: 'Failed to save customer data' }
  }
}

export async function exportCustomersToCSV(catalogId: number) {
  const supabase = await createClient()

  try {
    // 1. Get logged-in user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    // 2. Check if catalog belongs to user
    const { data: catalog, error: catalogError } = await supabase
      .from('catalogs')
      .select('id')
      .eq('id', catalogId)
      .eq('user_id', user.id)
      .single()

    if (catalogError || !catalog) {
      return { success: false, error: 'Unauthorized or catalog not found' }
    }

    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .eq('catalog_id', catalogId)
      .order('first_order_date', { ascending: false })

    if (error) {
      console.error('Error fetching customers:', error)
      return { success: false, error: error.message }
    }

    if (!customers || customers.length === 0) {
      return { success: false, error: 'No customers found' }
    }

    // Function to prevent CSV Injection (escaping formula symbols = + - @ and tab/return)
    const escapeCsv = (val: string) => {
      const cleaned = String(val || '')
      if (/^[=+\-@\t\r]/.test(cleaned)) {
        return `"'${cleaned.replace(/"/g, '""')}"`
      }
      return `"${cleaned.replace(/"/g, '""')}"`
    }

    // Create CSV content with byte order mark (BOM) for Excel UTF-8 Arabic support
    const BOM = '\uFEFF'
    const headers = ['الاسم', 'رقم الهاتف', 'العنوان', 'تاريخ أول طلب']
    const csvRows = [
      headers.join(','),
      ...customers.map(customer => [
        escapeCsv(customer.name),
        escapeCsv(customer.phone),
        escapeCsv(customer.address),
        escapeCsv(customer.first_order_date ? new Date(customer.first_order_date).toLocaleDateString('ar-EG') : '')
      ].join(','))
    ]

    const csvContent = BOM + csvRows.join('\n')

    return { success: true, data: csvContent }
  } catch (error) {
    console.error('Error exporting customers:', error)
    return { success: false, error: 'Failed to export customers' }
  }
}
