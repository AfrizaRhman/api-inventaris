import { Injectable, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { BaseService } from '../common/services/base.service';
import {
  QueryBuilderOptions,
  PaginationDto,
  SortDirection,
} from '../common/dto/pagination.dto';
import { CreateKnowledgeDto, UpdateKnowledgeDto } from './dto/knowledge.dto';

@Injectable()
export class KnowledgeService extends BaseService<any> {
  private webhookUrl: string;
  constructor(
    protected prismaService: PrismaService,
    configService: ConfigService,
  ) {
    super(prismaService);
    this.webhookUrl = configService.get<string>('KNOWLEDGE_WEBHOOK_URL', '');
  }

  protected getModel() {
    return this.prismaService.db.knowledge;
  }

  protected getQueryOptions(): QueryBuilderOptions {
    return {
      defaultSortField: 'created_at',
      defaultSortDirection: SortDirection.DESC,
      allowedSortFields: [
        'id',
        'odtw_id',
        'topic_code',
        'topic',
        'content',
        'status',
        'odtw',
        'created_at',
        'updated_at',
      ],
      allowedFilterFields: [
        'id',
        'odtw_id',
        'topic_code',
        'topic',
        'content',
        'status',
        'odtw',
        'created_at',
        'updated_at',
        'deleted_at',
      ],
      defaultSearchFields: [
        'odtw_id',
        'topic_code',
        'topic',
        'odtw',
        'content',
      ],
      softDeleteField: 'deleted_at',
    };
  }

  async createKnowledge(data: CreateKnowledgeDto) {
    if (!data.odtw_id) throw new ConflictException('odtw_id is required');
    if (!data.content) throw new ConflictException('content is required');
    const existing = await this.prismaService.db.knowledge.findFirst({
      where: { topic: data.topic },
    });
    if (existing) throw new ConflictException('Topic already exists');
    if (!data.topic_code) {
      data.topic_code = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
    }
    if (!data.status) data.status = 'active';

    const knowledge = await this.create(data);
    knowledge.action_status = 'new';
    const webhookResponse = await this.webHookN8nKnowledge(knowledge);

    return {
      ...knowledge,
      webhookResponse,
    };
  }

  async findAllKnowledgesPaginated(
    paginationDto: PaginationDto,
    additionalWhere: Record<string, any>,
  ) {
    return this.findAllPaginated(
      paginationDto,
      { ...additionalWhere, deleted_at: null },
      {
        id: true,
        odtw_id: true,
        topic_code: true,
        topic: true,
        content: true,
        status: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
        created_by: true,
        updated_by: true,
        deleted_by: true,
        odtw: true,
      },
    );
  }

  async findKnowledgeById(id: string) {
    return this.findById(id);
  }

  async updateKnowledge(id: string, data: UpdateKnowledgeDto) {
    const knowledge = await this.update(id, data);
    knowledge.action_status = 'edit';
    const webhookResponse = await this.webHookN8nKnowledge(knowledge);

    return {
      ...knowledge,
      webhookResponse,
    };
  }

  async softDeleteKnowledge(id: string, deleted_by?: string) {
    const knowledge = await this.update(id, {
      deleted_at: Math.floor(Date.now() / 1000),
      deleted_by,
    });
    knowledge.action_status = 'delete';
    const webhookResponse = await this.webHookN8nKnowledge(knowledge);

    return {
      ...knowledge,
      webhookResponse,
    };
  }

  async webHookN8nKnowledge(knowledge: any) {
    console.log('webhookUrl', this.webhookUrl);
    if (!this.webhookUrl || this.webhookUrl.trim() === '') {
      console.error(
        'KNOWLEDGE_WEBHOOK_URL is not set in environment variables.',
      );
      return;
    }
    return fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        odtw_id: knowledge.odtw_id,
        knowledge_id: knowledge.id,
        topic: knowledge.topic,
        content: knowledge.content,
        status: knowledge.action_status, // new/ edit/delete
      }),
    }).catch((err) => {
      console.error('Gagal kirim webhook ke N8N:', err.message);
    });
  }
}
