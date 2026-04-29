import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { query } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { websiteId, auditType } = await req.json()

    if (!websiteId || !auditType) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user's organization
    const orgResult = await query(
      `SELECT o.id FROM organizations o 
       WHERE o.user_id = $1 
       LIMIT 1`,
      [user.userId]
    )

    if (orgResult.rows.length === 0) {
      return NextResponse.json(
        { message: 'Organization not found' },
        { status: 404 }
      )
    }

    const orgId = orgResult.rows[0].id

    // Verify website belongs to user's organization
    const websiteResult = await query(
      `SELECT id, url FROM websites 
       WHERE id = $1 AND organization_id = $2`,
      [websiteId, orgId]
    )

    if (websiteResult.rows.length === 0) {
      return NextResponse.json(
        { message: 'Website not found' },
        { status: 404 }
      )
    }

    const website = websiteResult.rows[0]

    // Create audit report
    const reportResult = await query(
      `INSERT INTO audit_reports (website_id, audit_type, status) 
       VALUES ($1, $2, $3) 
       RETURNING id, website_id, audit_type, status, overall_score, created_at`,
      [websiteId, auditType, 'pending']
    )

    const report = reportResult.rows[0]

    // TODO: Queue background job to process audit
    // For now, we'll simulate audit data
    setTimeout(async () => {
      await processAudit(report.id, website.url, auditType)
    }, 1000)

    return NextResponse.json(
      { report },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create audit error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function processAudit(reportId: string, url: string, auditType: string) {
  try {
    // Generate mock audit data based on audit type
    const auditData = generateAuditData(auditType)

    // Update report with results
    await query(
      `UPDATE audit_reports 
       SET status = $1, overall_score = $2, data = $3, completed_at = NOW()
       WHERE id = $4`,
      ['completed', auditData.score, JSON.stringify(auditData.data), reportId]
    )

    // Update website last_audited_at
    const websiteResult = await query(
      `SELECT website_id FROM audit_reports WHERE id = $1`,
      [reportId]
    )

    if (websiteResult.rows.length > 0) {
      await query(
        `UPDATE websites SET last_audited_at = NOW() WHERE id = $1`,
        [websiteResult.rows[0].website_id]
      )
    }
  } catch (error) {
    console.error('Process audit error:', error)
    // Update report status to failed
    await query(
      `UPDATE audit_reports 
       SET status = $1, error_message = $2
       WHERE id = $3`,
      ['failed', 'Audit processing failed', reportId]
    )
  }
}

function generateAuditData(auditType: string) {
  const baseScore = Math.floor(Math.random() * 40) + 60 // 60-100

  const auditDataMap: Record<string, { score: number; data: any }> = {
    seo: {
      score: baseScore,
      data: {
        metaTitle: 'Present',
        metaDescription: 'Present',
        h1Tags: 1,
        headingStructure: 'Good',
        internalLinks: 42,
        externalLinks: 8,
        brokenLinks: 0,
        mobileFriendly: true,
        sitemapPresent: true,
        robotsTxtPresent: true,
        schemaMarkup: true,
        keywordDensity: { high: 3, medium: 5, low: 12 },
      },
    },
    performance: {
      score: baseScore,
      data: {
        pageLoadTime: Math.floor(Math.random() * 2000) + 1000,
        timeToFirstByte: Math.floor(Math.random() * 500) + 200,
        largestContentfulPaint: Math.floor(Math.random() * 2000) + 1000,
        firstInputDelay: Math.floor(Math.random() * 200) + 50,
        cumulativeLayoutShift: (Math.random() * 0.3).toFixed(3),
        totalPageSize: Math.floor(Math.random() * 2000) + 500,
        numberOfRequests: Math.floor(Math.random() * 80) + 30,
        unusedCss: Math.floor(Math.random() * 150) + 20,
        unusedJs: Math.floor(Math.random() * 300) + 50,
        lighthouseScore: baseScore,
      },
    },
    security: {
      score: baseScore,
      data: {
        sslCertificateValid: true,
        sslGrade: 'A',
        hasCsp: true,
        hasXFrameOptions: true,
        hasXContentTypeOptions: true,
        gdprCompliant: true,
        ccpaCompliant: true,
        vulnerabilities: Math.floor(Math.random() * 3),
        missingHeaders: Math.floor(Math.random() * 2),
      },
    },
    content: {
      score: baseScore,
      data: {
        totalWordCount: Math.floor(Math.random() * 5000) + 500,
        readabilityScore: Math.floor(Math.random() * 30) + 70,
        averageSentenceLength: (Math.random() * 10 + 15).toFixed(1),
        grammarIssues: Math.floor(Math.random() * 5),
        spellingIssues: Math.floor(Math.random() * 2),
        duplicateContent: false,
        keywordOptimization: 'Good',
      },
    },
    design: {
      score: baseScore,
      data: {
        accessibilityScore: Math.floor(Math.random() * 30) + 70,
        wcagCompliance: 'AA',
        contrastIssues: Math.floor(Math.random() * 5),
        missingAltText: Math.floor(Math.random() * 10),
        responsiveDesign: true,
        mobileUsabilityScore: Math.floor(Math.random() * 30) + 70,
        ctaClarityScore: Math.floor(Math.random() * 30) + 70,
      },
    },
    competitor: {
      score: baseScore,
      data: {
        competitors: [
          { name: 'Competitor A', score: Math.floor(Math.random() * 30) + 60 },
          { name: 'Competitor B', score: Math.floor(Math.random() * 30) + 60 },
        ],
        ranking: 'Above Average',
      },
    },
  }

  return auditDataMap[auditType] || { score: baseScore, data: {} }
}
