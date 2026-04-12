'use server'

import { createClient } from '@/lib/supabase/client'
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

    // Create CSV content
    const headers = ['الاسم', 'رقم الهاتف', 'العنوان', 'تاريخ أول طلب']
    const csvRows = [
      headers.join(','),
      ...customers.map(customer => [
        `"${customer.name}"`,
        `"${customer.phone}"`,
        `"${customer.address || ''}"`,
        `"${new Date(customer.first_order_date).toLocaleDateString('ar-EG')}"`
      ].join(','))
    ]

    const csvContent = csvRows.join('\n')

    return { success: true, data: csvContent }
  } catch (error) {
    console.error('Error exporting customers:', error)
    return { success: false, error: 'Failed to export customers' }
  }
}
