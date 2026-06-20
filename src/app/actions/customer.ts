'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveCustomerData(catalogId: number, name: string, phone: string, address: string) {
  const supabase = await createClient()

  try {
    // Check if customer already exists for this catalog with the same phone
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('catalog_id', catalogId)
      .eq('phone', phone)
      .single()

    // If customer doesn't exist, add them
    if (!existingCustomer) {
      const { error } = await supabase
        .from('customers')
        .insert({
          catalog_id: catalogId,
          name,
          phone,
          address,
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
